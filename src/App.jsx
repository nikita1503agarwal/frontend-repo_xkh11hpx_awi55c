import { useState, useEffect } from 'react'

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [topic, setTopic] = useState('Summer sale essentials for small brands')
  const [tone, setTone] = useState('friendly')
  const [platform, setPlatform] = useState('instagram')
  const [length, setLength] = useState('medium')
  const [includeEmojis, setIncludeEmojis] = useState(true)
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [variants, setVariants] = useState(3)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${BASE_URL}/api/captions`)
      .then(r => r.json())
      .then(data => setHistory(data.items || []))
      .catch(() => {})
  }, [])

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          tone,
          platform,
          length,
          include_emojis: includeEmojis,
          include_hashtags: includeHashtags,
          variants,
        })
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      setResults(data.variants)
      // Refresh history
      const h = await fetch(`${BASE_URL}/api/captions`).then(r=>r.json())
      setHistory(h.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copy = async (text) => {
    await navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const favorite = async (id, index) => {
    try {
      await fetch(`${BASE_URL}/api/captions/${id}/favorite?index=${index}`, { method: 'POST' })
      const h = await fetch(`${BASE_URL}/api/captions`).then(r=>r.json())
      setHistory(h.items || [])
    } catch {}
  }

  const toneOptions = ['friendly','professional','witty','bold','luxury','educational','casual']
  const platformOptions = ['instagram','tiktok','twitter','linkedin','youtube']

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="text-2xl font-bold tracking-tight">Blink Captions</div>
        <a href="/test" className="text-sm text-gray-600 hover:text-gray-900">System Check</a>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 bg-white/70 backdrop-blur border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Generate new captions</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Topic</label>
              <textarea value={topic} onChange={e=>setTopic(e.target.value)} rows={3}
                className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400" placeholder="What’s the post about?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tone</label>
                <select value={tone} onChange={e=>setTone(e.target.value)} className="w-full rounded-lg border-gray-300">
                  {toneOptions.map(t=> <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <select value={platform} onChange={e=>setPlatform(e.target.value)} className="w-full rounded-lg border-gray-300 capitalize">
                  {platformOptions.map(p=> <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Length</label>
                <select value={length} onChange={e=>setLength(e.target.value)} className="w-full rounded-lg border-gray-300">
                  <option value="short">short</option>
                  <option value="medium">medium</option>
                  <option value="long">long</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Variants</label>
                <input type="number" min="1" max="10" value={variants} onChange={e=>setVariants(parseInt(e.target.value)||1)} className="w-full rounded-lg border-gray-300" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeEmojis} onChange={e=>setIncludeEmojis(e.target.checked)} /> Emojis
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeHashtags} onChange={e=>setIncludeHashtags(e.target.checked)} /> Hashtags
              </label>
            </div>
            <button onClick={generate} disabled={loading} className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60">
              {loading ? 'Generating...' : 'Generate Captions'}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>
        </section>

        <section className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-3">Results</h3>
            {results.length === 0 ? (
              <p className="text-sm text-gray-500">Run a generation to see captions here.</p>
            ) : (
              <ul className="space-y-3">
                {results.map((c, i) => (
                  <li key={i} className="p-4 rounded-xl border bg-white hover:shadow-sm transition">
                    <div className="whitespace-pre-wrap text-gray-800">{c}</div>
                    <div className="mt-3 flex gap-3">
                      <button onClick={()=>copy(c)} className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white">Copy</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white/70 backdrop-blur border border-gray-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-3">Recent generations</h3>
            {history.length === 0 ? (
              <p className="text-sm text-gray-500">No history yet.</p>
            ) : (
              <ul className="space-y-3">
                {history.map((h) => (
                  <li key={h._id} className="p-4 rounded-xl border bg-white">
                    <div className="text-xs text-gray-500 mb-1">{new Date(h.created_at).toLocaleString?.() || ''}</div>
                    <div className="text-sm font-medium">{h.topic}</div>
                    <div className="text-xs text-gray-500">{h.tone} • {h.platform} • {h.length}</div>
                    <div className="mt-2 grid md:grid-cols-2 gap-2">
                      {(h.variants || []).map((v, idx)=> (
                        <div key={idx} className="p-3 border rounded-lg">
                          <div className="whitespace-pre-wrap text-gray-800 text-sm">{v}</div>
                          <div className="mt-2 flex gap-2">
                            <button onClick={()=>copy(v)} className="px-3 py-1.5 text-xs rounded-md bg-gray-900 text-white">Copy</button>
                            {!h.favorite && <button onClick={()=>favorite(h._id, idx)} className="px-3 py-1.5 text-xs rounded-md bg-amber-500 text-white">Favorite</button>}
                            {h.favorite && <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700">Favorited</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-500 py-10">Built with love • Generate captions in a blink</footer>
    </div>
  )
}

export default App
