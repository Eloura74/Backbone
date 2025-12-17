import imaplib
import smtplib
import email
from email.header import decode_header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self, host=None, port=None, user=None, password=None):
        self.imap_host = host or os.getenv("EMAIL_IMAP_HOST", "imap.gmail.com")
        self.smtp_host = host or os.getenv("EMAIL_SMTP_HOST", "smtp.gmail.com") # Usually similar, but can differ
        self.user = user or os.getenv("EMAIL_USER")
        self.password = password or os.getenv("EMAIL_PASSWORD")

    def _get_decoded_payload(self, part):
        """Helper to decode email part with charset detection"""
        payload = part.get_payload(decode=True)
        if not payload:
            return ""
        
        charset = part.get_content_charset()
        if not charset:
            charset = "utf-8"
        
        try:
            return payload.decode(charset, errors="replace")
        except:
            try:
                return payload.decode("utf-8", errors="replace")
            except:
                return payload.decode("latin-1", errors="replace")

    def fetch_unseen_emails(self, limit=10):
        """Fetch unseen emails from Inbox"""
        if not self.user or not self.password:
            print("Email credentials not configured.")
            return []

        emails = []
        try:
            # Connect to IMAP
            mail = imaplib.IMAP4_SSL(self.imap_host)
            mail.login(self.user, self.password)
            mail.select("inbox")

            # Search for unseen emails
            status, messages = mail.search(None, "UNSEEN")
            email_ids = messages[0].split()
            
            # Fetch latest first
            for e_id in email_ids[-limit:]:
                _, msg_data = mail.fetch(e_id, "(RFC822)")
                for response_part in msg_data:
                    if isinstance(response_part, tuple):
                        msg = email.message_from_bytes(response_part[1])
                        
                        # Decode Subject
                        subject, encoding = decode_header(msg["Subject"])[0]
                        if isinstance(subject, bytes):
                            subject = subject.decode(encoding or "utf-8")
                        
                        # Decode Sender
                        sender = msg.get("From")
                        
                        # Get Body & Attachments
                        body = ""
                        html_body = ""
                        attachments = []

                        if msg.is_multipart():
                            for part in msg.walk():
                                content_type = part.get_content_type()
                                content_disposition = str(part.get("Content-Disposition"))

                                if "attachment" in content_disposition:
                                    # Handle Attachment
                                    filename = part.get_filename()
                                    if filename:
                                        filename, encoding = decode_header(filename)[0]
                                        if isinstance(filename, bytes):
                                            filename = filename.decode(encoding or "utf-8")
                                        
                                        # Save attachment
                                        upload_dir = "uploads"
                                        if not os.path.exists(upload_dir):
                                            os.makedirs(upload_dir)
                                        
                                        filepath = os.path.join(upload_dir, f"{e_id.decode()}_{filename}")
                                        with open(filepath, "wb") as f:
                                            f.write(part.get_payload(decode=True))
                                        
                                        attachments.append({
                                            "filename": filename,
                                            "path": filepath,
                                            "type": content_type
                                        })
                                
                                elif content_type == "text/plain" and "attachment" not in content_disposition:
                                    body = self._get_decoded_payload(part)
                                elif content_type == "text/html" and "attachment" not in content_disposition:
                                    html_body = self._get_decoded_payload(part)
                        else:
                            content_type = msg.get_content_type()
                            payload = self._get_decoded_payload(msg)
                            if content_type == "text/html":
                                html_body = payload
                            else:
                                body = payload

                        emails.append({
                            "subject": subject,
                            "sender": sender,
                            "body": body,
                            "html_body": html_body,
                            "attachments": attachments
                        })
            
            mail.close()
            mail.logout()
            
        except Exception as e:
            print(f"Error fetching emails: {e}")
        
        return emails

    def send_email(self, to_email, subject, body, is_html=False):
        """Send an email via SMTP"""
        if not self.user or not self.password:
            raise Exception("Email credentials not configured.")

        try:
            msg = MIMEMultipart()
            msg['From'] = self.user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(self.smtp_host, 587)
            server.starttls()
            server.login(self.user, self.password)
            text = msg.as_string()
            server.sendmail(self.user, to_email, text)
            server.quit()
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            raise e
