import React, { useState, useCallback, useEffect } from 'react';
import { marked } from 'marked';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import { analyzeImage, translateText } from './services/analysisService';
import { translations } from './lib/translations';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<'en' | 'hi' | 'bn'>('en');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outputLanguage, setOutputLanguage] = useState<'English' | 'Hindi' | 'Bengali'>('English');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const t = translations[language];

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleImageSelect = useCallback((file: File | null) => {
    setSelectedImage(file);
    setAnalysisResult(null); // Clear previous results on new image selection
    setError(null); // Clear previous errors
  }, []);

  const handleOutputLanguageChange = async (newLang: 'English' | 'Hindi' | 'Bengali') => {
    if (newLang === outputLanguage) return;
    
    setOutputLanguage(newLang);

    if (analysisResult) {
      setLoading(true);
      try {
        const translated = await translateText(analysisResult, newLang);
        setAnalysisResult(translated);
      } catch (err) {
        console.error("Translation failed:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!selectedImage) {
      setError(t.selectImageError);
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Pass the selected output language to the analysis service
      const result = await analyzeImage(selectedImage, outputLanguage);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(t.analysisFailedError.replace('{errorMessage}', errorMessage));
    } finally {
      setLoading(false);
    }
  }, [selectedImage, outputLanguage, t]);

  const getSanitizedHtml = (markdown: string) => {
    const rawMarkup = marked.parse(markdown, { breaks: true, gfm: true });
    return { __html: rawMarkup as string };
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
        headerTitle={t.headerTitle}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-brand-off-white/70 dark:bg-brand-charcoal/60 backdrop-blur-lg p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-2xl text-center mb-8 border border-white/40 dark:border-white/20 animate-fade-in-up opacity-0">
          <h2 className="text-4xl md:text-5xl font-extrabold text-brand-emerald dark:text-brand-jade mb-4" style={{fontSize: '48px'}}>
            {t.mainTitle}
          </h2>
          <p className="text-lg text-brand-charcoal dark:text-brand-off-white mb-8 max-w-md mx-auto" style={{fontSize: '18px'}}>
            {t.mainDescription}
          </p>

          <ImageUploader 
            onImageSelect={handleImageSelect} 
            selectedImage={selectedImage}
            takePhotoText={t.takeAPhoto}
            uploadDeviceText={t.uploadFromDevice}
            imagePreviewText={t.imagePreview}
            clearSelectionText={t.clearSelection}
          />

          {selectedImage && (
            <div className="mt-8 mb-4 flex flex-col items-center animate-fade-in-up">
              <label className="mb-3 text-sm font-bold text-brand-charcoal dark:text-brand-off-white uppercase tracking-wider">
                {t.outputLanguage}
              </label>
              <div className="flex flex-wrap gap-4 p-1 bg-white/30 dark:bg-black/20 rounded-xl backdrop-blur-sm justify-center">
                <button
                  onClick={() => handleOutputLanguageChange('English')}
                  className={`px-6 py-2 rounded-lg font-bold transition-all duration-200 ${
                    outputLanguage === 'English' 
                      ? 'bg-brand-emerald text-white shadow-md' 
                      : 'bg-transparent text-brand-emerald dark:text-brand-jade hover:bg-white/20'
                  }`}
                  disabled={loading && !!analysisResult} // Optional: disable while translating
                >
                  {t.english}
                </button>
                <button
                  onClick={() => handleOutputLanguageChange('Hindi')}
                  className={`px-6 py-2 rounded-lg font-bold transition-all duration-200 ${
                    outputLanguage === 'Hindi' 
                      ? 'bg-brand-emerald text-white shadow-md' 
                      : 'bg-transparent text-brand-emerald dark:text-brand-jade hover:bg-white/20'
                  }`}
                  disabled={loading && !!analysisResult}
                >
                  {t.hindi}
                </button>
                <button
                  onClick={() => handleOutputLanguageChange('Bengali')}
                  className={`px-6 py-2 rounded-lg font-bold transition-all duration-200 ${
                    outputLanguage === 'Bengali' 
                      ? 'bg-brand-emerald text-white shadow-md' 
                      : 'bg-transparent text-brand-emerald dark:text-brand-jade hover:bg-white/20'
                  }`}
                  disabled={loading && !!analysisResult}
                >
                  {t.bengali}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedImage || loading}
            className="mt-6 w-full md:w-auto px-10 py-3 bg-brand-amber text-brand-emerald font-bold uppercase tracking-wider rounded-lg shadow-md hover:shadow-xl hover:shadow-brand-amber/30 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-amber disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 transform hover:scale-105"
            aria-label="Analyze selected photo"
          >
            {loading ? t.analyzing : t.analyzePhoto}
          </button>

          {error && (
            <div className="mt-6 p-4 bg-red-100 text-red-800 border border-red-300 rounded-lg text-left dark:bg-red-900/50 dark:text-red-200 dark:border-red-500/50">
              <p className="font-bold">{t.errorTitle}</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {analysisResult && (
          <div className="w-full max-w-3xl bg-brand-off-white/70 dark:bg-brand-charcoal/60 backdrop-blur-lg p-6 md:p-10 rounded-2xl shadow-2xl mt-8 mb-12 border border-white/40 dark:border-white/20 animate-fade-in-up opacity-0 [animation-delay:200ms]">
            <h3 className="text-3xl md:text-4xl font-extrabold text-brand-emerald dark:text-brand-jade mb-6 text-left">{t.analysisResultsTitle}</h3>
            <div
              className="analysis-content text-left font-sans text-brand-charcoal dark:text-brand-off-white bg-white/30 dark:bg-black/20 p-4 rounded-lg overflow-x-auto border border-white/40 dark:border-white/20"
              dangerouslySetInnerHTML={getSanitizedHtml(analysisResult)}
            />
          </div>
        )}
      </main>

      <footer className="w-full bg-brand-emerald/90 backdrop-blur-lg text-white p-4 text-center mt-auto border-t border-white/20">
        <p>{t.footerText.replace('{year}', new Date().getFullYear().toString())}</p>
      </footer>
    </div>
  );
};

export default App;