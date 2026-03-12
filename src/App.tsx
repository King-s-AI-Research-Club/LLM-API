import { FormEvent, useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: number;
  role: "user" | "bot";
  text: string;
};

const SYSTEM_PROMPT =
  "You are the user's favorite chatbot. Always keep a positive, supportive tone. Never provide explicit sexual content. Keep every answer concise and under 100 words.";

const limitWords = (text: string, maxWords: number): string => {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")}...`;
};

export default function App() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-3-flash-preview";
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "bot",
      text: "Hi there. I am Momo, your tiny Gemini buddy. Ask me anything."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userPrompt = prompt.trim();
    if (!userPrompt) return;

    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: userPrompt }]);
    setPrompt("");
    setLoading(true);
    setError(null);

    try {
      if (!apiKey) {
        throw new Error("Missing VITE_GEMINI_API_KEY in .env");
      }

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT }]
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }]
              }
            ]
          })
        }
      );

      if (!res.ok) {
        const data = (await res.json()) as { error?: { message?: string } };
        throw new Error(data.error?.message || "Request failed");
      }

      const data = (await res.json()) as {
        candidates?: Array<{
          content?: { parts?: Array<{ text?: string }> };
        }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No text returned from Gemini");
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: limitWords(text, 200) }
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "bot",
          text: "Oops, I could not answer that. Please check your API key and try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="chat-shell">
        <header className="chat-header">
          <div className="bot-avatar" aria-hidden="true">
            <span className="ear ear-left" />
            <span className="ear ear-right" />
            <span className="eye eye-left" />
            <span className="eye eye-right" />
            <span className="mouth" />
          </div>
          <div>
            <h1>Momo Chat</h1>
            <p>Powered by Gemini ({model})</p>
          </div>
        </header>

        <div className="chat-body">
          {messages.map((message) => (
            <article key={message.id} className={`bubble ${message.role}`}>
              <p>{message.text}</p>
            </article>
          ))}

          {loading && (
            <article className="bubble bot loading">
              <span />
              <span />
              <span />
            </article>
          )}
          <div ref={endRef} />
        </div>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={onSubmit} className="chat-input">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Message Momo..."
            rows={2}
          />
          <button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? "..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}
