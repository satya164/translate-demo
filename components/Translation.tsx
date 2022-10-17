import * as React from 'react';
import { Text as NativeText, TextProps } from 'react-native';
import useLatestCallback from 'use-latest-callback';

const API_KEY = '';

type TranslationProviderProps = {
  language: 'en' | 'es';
  children: React.ReactNode;
};

type TranslationContextValue = {
  loading: boolean;
  t: (text: string) => string;
  queue: (text: string) => void;
};

const fallback = () => {
  throw new Error(
    "Couldn't find translation context. Please wrap your app in a 'TranslationProvider'."
  );
};

export const TranslationContext = React.createContext<TranslationContextValue>({
  loading: false,
  t: fallback,
  queue: fallback,
});

export function TranslationProvider({
  language,
  children,
}: TranslationProviderProps) {
  const [loading, setLoading] = React.useState(false);
  const [translations, setTranslations] = React.useState<
    Record<string, string>
  >({});

  const t = React.useCallback(
    (text: string) => {
      if (language === 'en') {
        return text;
      }

      return translations[text];
    },
    [language, translations]
  );

  const queueRef = React.useRef<Set<string>>(new Set());
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    () => clearTimeout(timeoutRef.current);
  }, []);

  const translate = useLatestCallback(async () => {
    if (language === 'en') {
      return;
    }

    const contents = Array.from(queueRef.current);
    queueRef.current.clear();

    if (contents.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `https://api-free.deepl.com/v2/translate?source_lang=en&target_lang=es&split_sentences=0&${contents
          .map((text) => `text=${encodeURIComponent(text)}`)
          .join('&')}`,
        {
          method: 'POST',
          headers: {
            Authorization: `DeepL-Auth-Key ${API_KEY}`,
            'Content-Type': 'application/json; charset=utf-8',
          },
        }
      );

      const data = await res.json();

      setTranslations((prev) => ({
        ...prev,
        ...Object.fromEntries(
          contents.map((text, i) => [text, data.translations[i]?.text])
        ),
      }));
    } finally {
      setLoading(false);
    }
  });

  React.useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(translate, 100);
  }, [translate, language]);

  const queue = useLatestCallback((text: string) => {
    if (queueRef.current.has(text) || text in translations) {
      return;
    }

    queueRef.current.add(text);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(translate, 100);
  });

  const value = React.useMemo(
    () => ({ t, queue, loading }),
    [t, queue, loading]
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(text: string) {
  const { t, queue } = React.useContext(TranslationContext);

  React.useEffect(() => {
    queue(text);
  }, [queue, text]);

  return t(text);
}

export function Text({ children, ...rest }: { children: string } & TextProps) {
  const translated = useTranslation(children);

  return <NativeText {...rest}>{translated ?? children}</NativeText>;
}
