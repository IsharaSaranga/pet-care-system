import React, { useState } from 'react';
import axios from 'axios';

export default function AddMedicalRecordForm({ userId }) {
  const [type, setType] = useState('vaccination');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const token = localStorage.getItem('profToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/medical-records',
        { userId, type, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(data.message);
      setDescription('');
    } catch (error) {
      console.error('Error adding medical record:', error);
      setError(error.response?.data?.message || 'Failed to add medical record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-amber-950 font-medium">
            Record Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="vaccination">Vaccination</option>
            <option value="medical">Medical</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-amber-950 font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
            rows="4"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:bg-amber-400"
        >
          {submitting ? 'Submitting...' : 'Add Record'}
        </button>
      </form>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      {success && <p className="mt-2 text-green-600">{success}</p>}
    </div>
  );
}