from datetime import datetime, timedelta

class CalendarService:
    def generate_ics(self, summary, description, start_time=None, duration_minutes=60, location=""):
        """
        Generate an ICS file content string.
        """
        if not start_time:
            start_time = datetime.now() + timedelta(days=1)
            start_time = start_time.replace(hour=9, minute=0, second=0, microsecond=0)
        
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Format dates for ICS (YYYYMMDDTHHMMSSZ)
        # Note: For simplicity we use local time without timezone info or Z, 
        # which most calendars interpret as "floating" time (local to user).
        dt_start = start_time.strftime("%Y%m%dT%H%M%S")
        dt_end = end_time.strftime("%Y%m%dT%H%M%S")
        now = datetime.now().strftime("%Y%m%dT%H%M%S")
        
        ics_content = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Backbone//Calendar//EN",
            "BEGIN:VEVENT",
            f"UID:{now}-{summary.replace(' ', '')}@backbone.ai",
            f"DTSTAMP:{now}",
            f"DTSTART:{dt_start}",
            f"DTEND:{dt_end}",
            f"SUMMARY:{summary}",
            f"DESCRIPTION:{description.replace(chr(10), '\\n')}", # Escape newlines
            f"LOCATION:{location}",
            "END:VEVENT",
            "END:VCALENDAR"
        ]
        
        return "\n".join(ics_content)
