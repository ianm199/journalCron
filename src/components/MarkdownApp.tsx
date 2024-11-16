import React, { useState, useEffect } from 'react';
import MultiScalePlanner from "@/components/MultiScalePlanner";

const API_URL = 'http://localhost:8000';

export const MarkdownApp = () => {
  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Navigation state
  const [currentView, setCurrentView] = useState('home');

  // Note states
  const [note, setNote] = useState({ title: '', content: '' });
  const [preview, setPreview] = useState(false);
  const [notes, setNotes] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
  const [editingNoteData, setEditingNoteData] = useState({ title: '', content: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchNotes();
    }
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${API_URL}/notes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (err) {
      setError('Failed to fetch notes');
    }
  };

const handleUpdate = async (noteId, updatedNote) => {
  try {
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updatedNote),  // Now correctly using the passed updatedNote
    });

    if (response.ok) {
      fetchNotes();
      setEditingNote(null);
      setEditingNoteData({ title: '', content: '' });
    } else {
      setError('Failed to update note');
    }
  } catch (err) {
    setError('Failed to update note');
  }
};
  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        fetchNotes();
      } else {
        setError('Failed to delete note');
      }
    } catch (err) {
      setError('Failed to delete note');
    }
  };

    const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'username': email,
          'password': password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setIsLoggedIn(true);
        setCurrentView('home');
        setError('');
        fetchNotes();
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCurrentView('home');
    setNotes([]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setIsLoggedIn(true);
        setError('');
        fetchNotes();
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError('Registration failed');
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(note),
      });

      if (response.ok) {
        fetchNotes();
        setNote({ title: '', content: '' });
      } else {
        setError('Failed to save note');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to save note');
    }
  };

  const parseMarkdown = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-3xl font-bold my-4">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-2xl font-bold my-3">{line.slice(3)}</h2>;
        }

        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');

        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4">• {line.slice(2)}</li>;
        }

        return line ? (
          <p key={i} className="my-2" dangerouslySetInnerHTML={{ __html: line }} />
        ) : <br key={i} />;
      });
  };

  const HomePage = () => (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-black mb-4">Welcome to Your Dashboard</h1>
        <p className="text-lg text-gray-600">Choose what you'd like to do:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div
          onClick={() => setCurrentView('notes')}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h2 className="text-2xl font-bold text-black mb-2">📝 Notes</h2>
          <p className="text-gray-600">Create and manage your markdown notes</p>
          <div className="mt-4 text-sm text-gray-500">
            {notes.length} notes created
          </div>
        </div>

      <div
        onClick={() => setCurrentView('planning')}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <h2 className="text-2xl font-bold text-black mb-2">📅 Multi-Scale Planning</h2>
        <p className="text-gray-600">Plan and track your goals across different time scales</p>
      </div>
      </div>
    </div>
  );

  const Navigation = () => (
    <nav className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => setCurrentView('home')}
                className="text-xl font-bold text-black"
              >
                Dashboard
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

    if (!isLoggedIn) {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-3xl font-bold text-black">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-900">
                {error}
              </div>
            )}
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  onClick={handleLogin}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={handleRegister}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

// ... all the previous code and functions remain the same ...
// ... all the previous code and functions remain the same ...

return (
  <div className="min-h-screen bg-gray-50">
    <Navigation />

    <main className="p-6">
      {currentView === 'home' && <HomePage />}
      {currentView === 'planning' && <MultiScalePlanner />}
      {currentView === 'notes' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-black">Markdown Notes</h1>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-900">
              {error}
            </div>
          )}

          {!editingNote && (
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Note title"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={note.title}
                  onChange={(e) => setNote({ ...note, title: e.target.value })}
                />
              </div>

              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setPreview(!preview)}
                  className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  {preview ? 'Edit' : 'Preview'}
                </button>
              </div>

              {!preview ? (
                <textarea
                  value={note.content}
                  onChange={(e) => setNote({ ...note, content: e.target.value })}
                  placeholder="Write your note in markdown..."
                  className="w-full h-64 border border-gray-300 rounded-md p-4 font-mono text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <div className="w-full h-64 border border-gray-300 rounded-md p-4 overflow-auto text-black bg-white shadow-sm">
                  {parseMarkdown(note.content)}
                </div>
              )}

              <button
                onClick={handleSave}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Note
              </button>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Your Notes</h2>
            <div className="space-y-4">
              {notes.map((n) => (
                <div key={n.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                  {editingNote === n.id ? (
                    <div>
                      <input
                        type="text"
                        value={editingNoteData.title}
                        onChange={(e) => setEditingNoteData({ ...editingNoteData, title: e.target.value })}
                        className="w-full mb-2 border border-gray-300 rounded-md px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <textarea
                        value={editingNoteData.content}
                        onChange={(e) => setEditingNoteData({ ...editingNoteData, content: e.target.value })}
                        className="w-full h-40 border border-gray-300 rounded-md p-4 font-mono text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={() => handleUpdate(n.id, editingNoteData)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingNote(null);
                            setEditingNoteData({ title: '', content: '' });
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-black">{n.title}</h3>
                        <div className="space-x-2">
                          <button
                            onClick={() => {
                              setEditingNote(n.id);
                              setEditingNoteData({ title: n.title, content: n.content });
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-black">
                        {parseMarkdown(n.content)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  </div>
);
};