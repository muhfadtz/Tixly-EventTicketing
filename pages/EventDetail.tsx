import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../services/firebase';
import firebase from 'firebase/compat/app'; // Needed for Timestamp
import { Event } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { appUser, currentUser } = useAuth();
  
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  useEffect(() => {
    // @ts-ignore
    window.lucide?.createIcons();
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        const eventDocRef = db.collection('events').doc(id);
        const eventDoc = await eventDocRef.get();
        if (eventDoc.exists) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        setError('Failed to fetch event details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);
  
  useEffect(() => {
    const checkRegistration = async () => {
        if (appUser?.role === 'peserta' && currentUser && id) {
            try {
                const ticketsQuery = db.collection('tickets')
                    .where('userId', '==', currentUser.uid)
                    .where('eventId', '==', id)
                    .limit(1);

                const querySnapshot = await ticketsQuery.get();
                setIsAlreadyRegistered(!querySnapshot.empty);
            } catch (err) {
                console.error("Error checking registration status:", err);
            } finally {
                setCheckingRegistration(false);
            }
        } else {
            setCheckingRegistration(false);
        }
    };
    
    checkRegistration();
}, [currentUser, appUser, id]);


  const handleRegister = async () => {
    if (!appUser || !currentUser || !event) return;
    setRegistering(true);
    setError('');
    try {
      const ticketData = {
        eventId: event.id,
        userId: currentUser.uid,
        namaPeserta: appUser.namaLengkap,
        emailPeserta: appUser.email,
        status: 'paid' as const,
        createdAt: firebase.firestore.Timestamp.now(),
        qrCodeString: '',
      };
      
      const ticketsCollectionRef = db.collection('tickets');
      const ticketRef = await ticketsCollectionRef.add(ticketData);
      
      const qrCodeString = ticketRef.id;
      await ticketRef.update({ qrCodeString });

      alert('Registration successful! Your ticket is now available in "My Tickets".');
      navigate('/my-tickets');

    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;
  if (error) return <div className="text-center mt-10 text-destructive">{error}</div>;
  if (!event) return <div className="text-center mt-10">Event could not be loaded.</div>;

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
      <img className="h-64 w-full object-cover" src={`https://picsum.photos/seed/${event.id}/1200/400`} alt={event.namaAcara} />
      <div className="p-8">
        <h1 className="text-4xl font-bold mb-4 text-foreground">{event.namaAcara}</h1>
        <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6 text-lg text-muted-foreground">
          <div className="flex items-center">
            <i data-lucide="calendar" className="h-5 w-5 mr-2 text-primary"></i>
            <span>{event.tanggal && new Date(event.tanggal.seconds * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center">
            <i data-lucide="map-pin" className="h-5 w-5 mr-2 text-primary"></i>
            <span>{event.lokasi}</span>
          </div>
          <div className="flex items-center">
            <i data-lucide="tag" className="h-5 w-5 mr-2 text-primary"></i>
            <span>Rp {event.harga.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-foreground/80 mb-8 leading-relaxed">{event.deskripsiSingkat}</p>
        
        {appUser?.role === 'peserta' ? (
          checkingRegistration ? (
             <button disabled className="w-full bg-muted text-muted-foreground px-8 py-3 rounded-lg text-lg font-bold cursor-not-allowed flex justify-center items-center">
                <Spinner size="sm" />
                <span className="ml-2">Checking status...</span>
            </button>
          ) : isAlreadyRegistered ? (
             <div className="text-center text-green-500 bg-green-500/10 p-4 rounded-lg">
                <p className="font-semibold">
                    You are already registered!{' '}
                    <Link to="/my-tickets" className="font-bold underline hover:text-green-400">
                        View Your Ticket
                    </Link>
                </p>
            </div>
          ) : (
            <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg text-lg font-bold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex justify-center items-center"
            >
                {registering ? (
                  <>
                    <Spinner size="sm" className="text-primary-foreground" />
                    <span className="ml-2">Registering...</span>
                  </>
                ) : 'Register Now'}
            </button>
          )
        ) : (
          <div className="text-center text-accent-foreground bg-accent p-3 rounded-lg">
            <p>
              {appUser ? "Only participants can register for events." : "Please login as a participant to register."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;