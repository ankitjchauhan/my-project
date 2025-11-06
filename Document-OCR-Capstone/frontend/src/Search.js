import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';

const Search = forwardRef(function Search(props, ref){
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('');
  const [stats, setStats] = useState({ documents: 0, pages: 0, searches: 0 });
  const SERVER = 'http://localhost:5001';

  // Fetch stats on component mount and periodically
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const res = await axios.get(`${SERVER}/api/stats`);
      if (res.data && res.data.ok && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }

  // Expose refreshStats method to parent via ref
  useImperativeHandle(ref, () => ({
    refreshStats: fetchStats
  }));

  function escapeHtml(str){
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function highlight(text, q){
    if (!q) return escapeHtml(text);
    try {
      const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
      return escapeHtml(text).replace(re, '<mark>$1</mark>');
    } catch {
      return escapeHtml(text);
    }
  }

  async function doSearch(e){
    e && e.preventDefault();
    if (!q) {
      setStatus('Enter a search term');
      setResults([]);
      return;
    }
    setStatus('Searching...');
    try {
      const res = await axios.get(`${SERVER}/api/search?q=` + encodeURIComponent(q));
      const results = res.data.results || [];
      setResults(results);
      setStatus(results.length ? `Found matches in ${results.length} document(s)` : 'No matches found');
      
      // Refresh stats after search
      fetchStats();
    } catch (err) {
      setStatus('Search failed: ' + (err.message || 'network'));
      setResults([]);
    }
  }

  // Clear results when query is cleared to avoid showing stale matches
  function onChangeQuery(val){
    setQ(val);
    if (!val) {
      setResults([]);
      setStatus('');
    }
  }

  return (
    <div className="panel" aria-live="polite">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h3 style={{ margin:0 }}>Search Documents</h3>
          <div className="sub muted" style={{ marginTop:6 }}>Find text inside uploaded documents.</div>
        </div>
      </div>

      <form onSubmit={doSearch} style={{ marginTop:12, display:'flex', gap:8 }}>
        <input className="search-input" value={q} onChange={e => onChangeQuery(e.target.value)} placeholder="Enter keywords..." />
        <button className="btn primary">Search</button>
      </form>

      {/* Real-time Stats */}
      <div className="stats-container" style={{ marginTop: 20 }}>
        <div className="stat-card">
          <div className="stat-value">{stats.documents}</div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pages}</div>
          <div className="stat-label">Pages</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.searches}</div>
          <div className="stat-label">Searches</div>
        </div>
      </div>

      <div style={{ marginTop:12 }}>
        <div className="muted" style={{ marginBottom:8 }}>{status}</div>
        <div className="results">
          {results.length === 0 ? (
            <div className="muted">No results — try uploading a document or change your query.</div>
          ) : (
            results.map(d => (
              <div className="result-card" key={d._id || d.id || d.title}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
                  <div style={{ fontWeight:700 }}>{d.title || d.filename || 'Document'}</div>
                  <div className="muted" style={{ fontSize:13 }}>{d._id || d.id ? String(d._id || d.id).slice(0,8) : ''}</div>
                </div>

                {/* Multi-page results display */}
                {d.pages && d.pages.map(p => (
                  <div key={p.pageNumber} style={{ marginTop:10, background:'rgba(255,255,255,0.05)', padding:12, borderRadius:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div className="muted" style={{ fontSize:12 }}>Page {p.pageNumber}</div>
                      <div className="muted" style={{ fontSize:12 }}>Confidence: {Math.round(p.confidence || 0)}%</div>
                    </div>
                    <div style={{ marginTop:8, whiteSpace:'pre-wrap', fontSize:14, lineHeight:'1.5' }}>
                      <div dangerouslySetInnerHTML={{ __html: highlight(p.snippet || '', q) }} />
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

export default Search;