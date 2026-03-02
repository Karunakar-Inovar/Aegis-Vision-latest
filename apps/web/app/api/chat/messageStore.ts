import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export type StoredMessage = ChatCompletionMessageParam & {
  id?: string;
};

export interface MessageStore {
  addMessage(message: StoredMessage): void;
  messageList: StoredMessage[];
  getOpenAICompatibleMessageList(): ChatCompletionMessageParam[];
}

const stores = new Map<string, MessageStore>();

function createStore(threadId: string): MessageStore {
  const messageList: StoredMessage[] = [];

  const store: MessageStore = {
    messageList,

    addMessage(message: StoredMessage) {
      messageList.push(message);
    },

    getOpenAICompatibleMessageList(): ChatCompletionMessageParam[] {
      return messageList.map(({ id: _id, ...rest }) => rest);
    },
  };

  stores.set(threadId, store);
  return store;
}

/**
 * Returns an in-memory message store for the given threadId.
 * Each store is keyed by threadId and exposes addMessage, messageList, and getOpenAICompatibleMessageList.
 */
export function getMessageStore(threadId: string): MessageStore {
  const existing = stores.get(threadId);
  if (existing) return existing;
  return createStore(threadId);
}
