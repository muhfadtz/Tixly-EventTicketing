import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { Ticket, Event } from '../types';
import Spinner from '../components/Spinner';

const EventAttendees: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const [attendees, setAttendees] = useState<Ticket[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // @ts-ignore
    window.lucide?.createIcons();
  }, []);


  useEffect(() => {
    if (!eventId) return;

    const fetchAttendees = async () => {
      setLoading(true);
      try {
        const eventDoc = await db.collection('events').doc(eventId).get();
        if (eventDoc.exists) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
        }

        const ticketsCollectionRef = db.collection('tickets');
        const q = ticketsCollectionRef.where('eventId', '==', eventId);
        const ticketSnapshot = await q.get();
        const attendeesList = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
        setAttendees(attendeesList);

      } catch (error) {
        console.error("Error fetching attendees: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [eventId]);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
            <Spinner size="lg" />
        </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4">
       <Link to="/panitia/dashboard" className="text-primary hover:underline mb-6 inline-flex items-center">
        <i data-lucide="arrow-left" className="h-4 w-4 mr-2"></i>
        Back to Dashboard
       </Link>
      <h1 className="text-3xl font-bold text-foreground mb-2">Attendees for</h1>
      <h2 className="text-4xl font-bold text-primary mb-8">{event?.namaAcara || 'Event'}</h2>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {attendees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Participant Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ticket Status</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {attendees.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{ticket.namaPeserta}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{ticket.emailPeserta}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ticket.status === 'paid' ? 'bg-green-500/10 text-green-400' :
                          ticket.status === 'used' ? 'bg-red-500/10 text-red-400' :
                          'bg-yellow-500/10 text-yellow-400'
                      }`}>
                          {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">No one has registered for this event yet.</p>
        )}
      </div>
    </div>
  );
};

export default EventAttendees;