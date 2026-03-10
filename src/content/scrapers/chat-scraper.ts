import type { ChatData, ChatMessage } from "../../shared/types";

export function scrapeChat(): ChatData {
  const getText = (selector: string) =>
    document.querySelector(selector)?.textContent?.trim() || "";

  // Contact name
  const contactName =
    getText('[data-test="room-header-name"]') ||
    getText('[data-qa="room-header"] .name') ||
    getText(".room-header .user-name") ||
    getText(".msg-room-header h4") ||
    "";

  // Job title from conversation
  const jobTitle =
    getText('[data-test="room-header-job"]') ||
    getText('[data-qa="room-header"] .job-title') ||
    getText(".room-header .job-link") ||
    getText(".msg-room-header .job-title") ||
    "";

  // Messages
  const messageElements = document.querySelectorAll(
    '[data-test="message"], ' +
    '.msg-body, ' +
    '[data-qa="message-body"], ' +
    '.thread-message'
  );

  const messages: ChatMessage[] = Array.from(messageElements).map((el) => {
    const senderEl = el.querySelector(
      '[data-test="message-sender"], ' +
      '.sender-name, ' +
      '[data-qa="sender-name"], ' +
      '.msg-sender'
    );
    const textEl = el.querySelector(
      '[data-test="message-text"], ' +
      '.msg-text, ' +
      '[data-qa="message-text"], ' +
      '.text-body'
    );
    const timeEl = el.querySelector(
      '[data-test="message-time"], ' +
      '.msg-time, ' +
      '[data-qa="message-time"], ' +
      'time'
    );

    return {
      sender: senderEl?.textContent?.trim() || "Unknown",
      text: textEl?.textContent?.trim() || el.textContent?.trim() || "",
      timestamp: timeEl?.getAttribute("datetime") || timeEl?.textContent?.trim() || "",
    };
  });

  return {
    contactName,
    jobTitle,
    messages,
  };
}

// Watch for new messages with MutationObserver
export function observeNewMessages(callback: (chat: ChatData) => void): () => void {
  const messageContainer = document.querySelector(
    '[data-test="messages-container"], ' +
    '.msg-thread, ' +
    '[data-qa="message-list"], ' +
    '.messages-list'
  );

  if (!messageContainer) return () => {};

  const observer = new MutationObserver(() => {
    callback(scrapeChat());
  });

  observer.observe(messageContainer, {
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
}
