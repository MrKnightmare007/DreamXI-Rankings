'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ user }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user.name || '',
    dreamXIUsername: user.dreamXIUsername || '',
    profilePicture: user.profilePicture || user.image || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        router.refresh(); // Refresh the page to show updated data
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Edit Profile</h3>
      
      {message.text && (
        <div className={`p-3 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label htmlFor="dreamXIUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dream11 Username
            </label>
            <input
              type="text"
              id="dreamXIUsername"
              name="dreamXIUsername"
              value={formData.dreamXIUsername}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your Dream11 username"
            />
          </div>
          
          <div>
            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Profile Picture URL
            </label>
            <input
              type="text"
              id="profilePicture"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com/your-image.jpg"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}