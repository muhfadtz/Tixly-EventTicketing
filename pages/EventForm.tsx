import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import firebase from 'firebase/compat/app';
import { useAuth } from '../contexts/AuthContext';
import { Event } from '../types';
import Spinner from '../components/Spinner';

const EventForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [namaAcara, setNamaAcara] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [harga, setHarga] = useState(0);
  const [deskripsiSingkat, setDeskripsiSingkat] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false); // For submission
  const [error, setError] = useState('');
  
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && currentUser) {
      setLoading(true);
      const fetchEvent = async () => {
        try {
          const eventDoc = await db.collection('events').doc(id).get();
          if (eventDoc.exists) {
            const eventData = eventDoc.data() as Event;
            if (eventData.organizerId !== currentUser?.uid) {
                setError("You are not authorized to edit this event.");
                return;
            }
            setNamaAcara(eventData.namaAcara);
            const eventDate = eventData.tanggal.toDate();
            setTanggal(eventDate.toISOString().split('T')[0]);
            setLokasi(eventData.lokasi);
            setHarga(eventData.harga);
            setDeskripsiSingkat(eventData.deskripsiSingkat);
          } else {
            setError('Event not found.');
          }
        } catch (err) {
          setError('Failed to load event data.');
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to create or edit events.');
      return;
    }
    setError('');
    setFormLoading(true);

    try {
      const eventDate = new Date(tanggal);
      const eventData = {
        namaAcara,
        tanggal: firebase.firestore.Timestamp.fromDate(eventDate),
        lokasi,
        harga: Number(harga),
        deskripsiSingkat,
        organizerId: currentUser.uid,
      };

      if (isEditMode) {
        await db.collection('events').doc(id).update(eventData);
        alert('Event updated successfully!');
      } else {
        const newEventData = { ...eventData, isPublished: false };
        await db.collection('events').add(newEventData);
        alert('Event created as a draft! Publish it from your dashboard.');
      }
      
      navigate('/panitia/dashboard');

    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const inputStyles = "w-full px-3 py-2 mt-1 text-foreground bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring";

  if (loading) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
            <Spinner size="lg" />
        </div>
      );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8 text-foreground">
        {isEditMode ? 'Edit Event' : 'Create a New Event'}
      </h1>
      <div className="w-full p-8 bg-card border border-border rounded-lg shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-destructive text-center bg-destructive/10 border border-destructive/20 rounded-md p-3">{error}</p>}
          
          <div>
            <label className="block text-sm font-medium text-foreground">Event Name</label>
            <input type="text" value={namaAcara} onChange={e => setNamaAcara(e.target.value)} required className={inputStyles} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-foreground">Date</label>
                <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} required className={inputStyles} />
            </div>
            <div>
                <label className="block text-sm font-medium text-foreground">Price (Rp)</label>
                <input type="number" value={harga} onChange={e => setHarga(Number(e.target.value))} required min="0" className={inputStyles} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground">Location</label>
            <input type="text" value={lokasi} onChange={e => setLokasi(e.target.value)} required className={inputStyles} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Short Description</label>
            <textarea value={deskripsiSingkat} onChange={e => setDeskripsiSingkat(e.target.value)} required rows={4} className={inputStyles}></textarea>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
             <button type="button" onClick={() => navigate('/panitia/dashboard')} className="py-2 px-4 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold rounded-md transition-colors">
                Cancel
            </button>
            <button type="submit" disabled={formLoading} className="py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center min-w-[140px]">
              {formLoading ? <Spinner size="sm" /> : (isEditMode ? 'Save Changes' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;