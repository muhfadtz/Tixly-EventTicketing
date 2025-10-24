import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { Event } from '../types';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  useEffect(() => {
    // @ts-ignore
    window.lucide?.createIcons();
  });
  
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="relative">
         <img className="h-48 w-full object-cover" src={`https://picsum.photos/seed/${event.id}/400/200`} alt={event.namaAcara} />
         <div className="absolute bottom-0 left-0 bg-black/50 text-white px-4 py-1 text-lg font-bold">
           Rp {event.harga.toLocaleString()}
         </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-card-foreground">{event.namaAcara}</h3>
        <div className="space-y-2 text-muted-foreground text-sm">
            <div className="flex items-center">
                <i data-lucide="calendar" className="h-4 w-4 mr-2"></i>
                <span>{event.tanggal && new Date(event.tanggal.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center">
                <i data-lucide="map-pin" className="h-4 w-4 mr-2"></i>
                <span>{event.lokasi}</span>
            </div>
        </div>
        <div className="mt-6">
          <Link to={`/event/${event.id}`} className="w-full inline-flex justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};


const EventsList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollectionRef = db.collection('events');
        const q = eventsCollectionRef.where('isPublished', '==', true);
        const eventSnapshot = await q.get();
        const eventsList = eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        
        eventsList.sort((a, b) => a.tanggal.seconds - b.tanggal.seconds);

        setEvents(eventsList);
      } catch (error)
      {
        console.error("Error fetching events: ", error);
        alert("Could not fetch events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div className="flex justify-center mt-10"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mb-12 text-foreground">Upcoming Events</h1>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-card border border-dashed border-border rounded-lg">
          <i data-lucide="calendar-x" className="mx-auto h-12 w-12 text-muted-foreground"></i>
          <h3 className="mt-4 text-lg font-semibold">No Events Found</h3>
          <p className="mt-2 text-sm text-muted-foreground">There are currently no upcoming events. Please check back later.</p>
        </div>
      )}
    </div>
  );
};

export default EventsList;