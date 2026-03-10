import type { MeetingData } from "../../shared/types";

export function scrapeMeetings(): MeetingData[] {
  const meetings: MeetingData[] = [];

  // Look for meeting-related content in messages
  const messageElements = document.querySelectorAll(
    '[data-test="message"], .msg-body, [data-qa="message-body"]'
  );

  const meetingPatterns = [
    /(?:meeting|call|interview|zoom|google meet|teams)\s+(?:at|on|scheduled for)\s+(.+)/i,
    /(?:let's|let us|shall we|can we)\s+(?:meet|call|talk|chat)\s+(?:at|on)\s+(.+)/i,
    /(?:scheduled|booked|set up)\s+(?:a\s+)?(?:meeting|call|interview)\s+(?:for|on|at)\s+(.+)/i,
  ];

  const getText = (selector: string) =>
    document.querySelector(selector)?.textContent?.trim() || "";

  const contactName =
    getText('[data-test="room-header-name"]') ||
    getText(".room-header .user-name") ||
    "";

  const jobContext =
    getText('[data-test="room-header-job"]') ||
    getText(".room-header .job-link") ||
    "";

  Array.from(messageElements).forEach((el) => {
    const text = el.textContent?.trim() || "";
    for (const pattern of meetingPatterns) {
      const match = text.match(pattern);
      if (match) {
        meetings.push({
          title: "Upcoming Meeting",
          scheduledTime: match[1]?.trim() || "",
          contactName,
          jobContext,
        });
        break;
      }
    }
  });

  // Also check for Upwork's built-in meeting/video call elements
  const meetingCards = document.querySelectorAll(
    '[data-test="meeting-card"], .meeting-invitation, .video-call-card'
  );

  Array.from(meetingCards).forEach((card) => {
    const title = card.querySelector("h3, .title")?.textContent?.trim() || "Scheduled Meeting";
    const time = card.querySelector("time, .date")?.textContent?.trim() || "";

    meetings.push({
      title,
      scheduledTime: time,
      contactName,
      jobContext,
    });
  });

  return meetings;
}
