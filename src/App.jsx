import React, { useEffect, useMemo, useState } from 'react';
import GlobeCanvas from './components/GlobeCanvas';
import StoryModal from './components/StoryModal';
import ThemeSwitcher from './components/ThemeSwitcher';
import storiesJson from './data/stories.json';

export default function App() {
  const [stories, setStories] = useState(() => {
    // merge default stories with localStorage user submissions
    const saved = localStorage.getItem('userStories');
    const parsed = saved ? JSON.parse(saved) : [];
    return [...storiesJson, ...parsed];
  });

  const [activeStory, setActiveStory] = useState(null);
  const [theme, setTheme] = useState('Cultural');

  useEffect(() => {
    // basic day/night ambient cycle based on local time (optional)
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setTheme((t) => (t === 'Sci-Fi' ? 'Sci-Fi' : 'Historical'));
  }, []);

  const onPinClick = (pinData) => {
    // find story by id
    const story = stories.find((s) => s.id === pinData.id) || pinData;
    setActiveStory(story);
  };

  const onClose = () => setActiveStory(null);

  const currentIndex = useMemo(
    () => stories.findIndex((s) => activeStory && s.id === activeStory.id),
    [activeStory, stories]
  );

  const goNext = () => {
    if (stories.length === 0) return;
    const nextIndex = (currentIndex + 1) % stories.length;
    setActiveStory(stories[nextIndex]);
  };

  const goPrev = () => {
    if (stories.length === 0) return;
    const prevIndex = (currentIndex - 1 + stories.length) % stories.length;
    setActiveStory(stories[prevIndex]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4">
        <h1 className="text-xl font-semibold">StoryGlobe — spin & discover</h1>
        <div className="flex items-center gap-4">
          <ThemeSwitcher theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 rounded-lg bg-gradient-to-br from-gray-800 to-black p-2">
            <GlobeCanvas onPinClick={onPinClick} theme={theme} />
            <p className="text-sm text-gray-400 mt-2">
              Tip: Drag to rotate, scroll/touch to zoom, click a pin to open its story.
            </p>
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Stories</h3>
              <ul className="space-y-2 max-h-[50vh] overflow-auto">
                {stories.map((s) => (
                  <li key={s.id}>
                    <button
                      className="w-full text-left p-2 rounded hover:bg-white/5"
                      onClick={() => setActiveStory(s)}
                    >
                      <div className="flex justify-between">
                        <span>{s.title}</span>
                        <small className="text-gray-400">{s.lat?.toFixed?.(1)},{s.lng?.toFixed?.(1)}</small>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Contribute</h3>
              <p className="text-sm text-gray-300 mb-2">Add your short story (lat & lng)</p>
              <ContributeForm
                onAdd={(newStory) => {
                  const updated = [newStory, ...stories];
                  setStories(updated);
                  // persist user-submitted stories in localStorage (demo)
                  const existing = JSON.parse(localStorage.getItem('userStories') || '[]');
                  existing.push(newStory);
                  localStorage.setItem('userStories', JSON.stringify(existing));
                }}
              />
            </div>
          </aside>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-gray-400">
        Deployed with Vite • Uses three-globe by vasturiano. :contentReference[oaicite:2]{index=2}
      </footer>

      <StoryModal story={activeStory} onClose={onClose} onNext={goNext} onPrev={goPrev} />
    </div>
  );
}

/* ContributeForm: small inline component */
function ContributeForm({ onAdd }) {
  const [title, setTitle] = React.useState('');
  const [lat, setLat] = React.useState('');
  const [lng, setLng] = React.useState('');
  const [content, setContent] = React.useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!title || !lat || !lng) return alert('Provide title, lat and lng');
    const newStory = {
      id: 'u' + Date.now(),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      title,
      content: content || 'A user-submitted story.',
      media: {}
    };
    onAdd(newStory);
    setTitle('');
    setLat('');
    setLng('');
    setContent('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input className="w-full p-2 bg-black/20 rounded" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <div className="flex gap-2">
        <input className="flex-1 p-2 bg-black/20 rounded" placeholder="Latitude" value={lat} onChange={(e)=>setLat(e.target.value)} />
        <input className="flex-1 p-2 bg-black/20 rounded" placeholder="Longitude" value={lng} onChange={(e)=>setLng(e.target.value)} />
      </div>
      <textarea className="w-full p-2 bg-black/20 rounded" placeholder="Short content" value={content} onChange={(e)=>setContent(e.target.value)} />
      <button className="px-3 py-2 bg-white text-black rounded">Add Story</button>
    </form>
  );
}
