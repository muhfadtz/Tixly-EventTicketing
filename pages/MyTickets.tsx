import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Ticket, Event } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const TicketCard: React.FC<{ ticket: Ticket }> = ({ ticket }) => {
    useEffect(() => {
        // @ts-ignore
        window.lucide?.createIcons();
    });
    
    const handleDownload = () => {
        const canvas = document.getElementById(`qr-code-${ticket.id}`) as HTMLCanvasElement;
        if (canvas) {
            // Create a new canvas with padding and a white background
            const padding = 20;
            const newCanvas = document.createElement('canvas');
            newCanvas.width = canvas.width + padding * 2;
            newCanvas.height = canvas.height + padding * 2;
            const ctx = newCanvas.getContext('2d');
            if (ctx) {
                // Fill background with white
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
                // Draw the QR code canvas onto the new canvas
                ctx.drawImage(canvas, padding, padding);
            }

            const pngUrl = newCanvas
                .toDataURL("image/png")
                .replace("image/png", "image/octet-stream");
            let downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `Tixly-Ticket-${ticket.event?.namaAcara?.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
    };

    return (
        <div className="bg-card text-card-foreground max-w-sm mx-auto rounded-xl shadow-lg overflow-hidden border border-border">
            <div className="p-6 bg-primary text-primary-foreground">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Reservation Details</h2>
                    <i data-lucide="share-2" className="w-5 h-5"></i>
                </div>
            </div>
            <div className="p-6">
                <div className="mb-6">
                    <p className="text-lg font-semibold">{ticket.event?.namaAcara}</p>
                    <p className="text-sm text-muted-foreground">{ticket.event && ticket.event.tanggal ? new Date(ticket.event.tanggal.seconds * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Loading...'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                        <p className="text-muted-foreground">Participant</p>
                        <p className="font-semibold">{ticket.namaPeserta}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-semibold">{ticket.event?.lokasi}</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Ticket ID</p>
                        <p className="font-mono text-xs">{ticket.id.substring(0,10)}...</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className={`font-semibold ${ ticket.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>{ticket.status.toUpperCase()}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border">
                    <QRCodeCanvas 
                        id={`qr-code-${ticket.id}`} 
                        value={ticket.qrCodeString} 
                        size={180} 
                        bgColor={"#ffffff"} 
                        fgColor={"#000000"}
                        level={"M"} // Medium level for better scannability
                    />
                    <p className="mt-4 text-xs text-center text-muted-foreground">Just show your QR code while entering the event.</p>
                </div>
                
                <div className="mt-6">
                     <button
                        onClick={handleDownload}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!currentUser) return;
      try {
        const ticketsCollectionRef = db.collection('tickets');
        const q = ticketsCollectionRef.where('userId', '==', currentUser.uid);
        const ticketSnapshot = await q.get();
        const ticketsList = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
        
        const ticketsWithEvents = await Promise.all(
          ticketsList.map(async (ticket) => {
            const eventDocRef = db.collection('events').doc(ticket.eventId);
            const eventDoc = await eventDocRef.get();
            if (eventDoc.exists) {
              ticket.event = { id: eventDoc.id, ...eventDoc.data() } as Event;
            }
            return ticket;
          })
        );
        
        ticketsWithEvents.sort((a,b) => b.createdAt.seconds - a.createdAt.seconds);
        setTickets(ticketsWithEvents);
      } catch (error) {
        console.error("Error fetching tickets: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [currentUser]);

  if (loading) {
    return <div className="flex justify-center mt-10"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center mb-12 text-foreground">My Tickets</h1>
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
         <div className="text-center py-16 px-4 bg-card border border-dashed border-border rounded-lg">
          <i data-lucide="ticket-slash" className="mx-auto h-12 w-12 text-muted-foreground"></i>
          <h3 className="mt-4 text-lg font-semibold">No Tickets Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">You haven't registered for any events. Why not find one?</p>
           <Link to="/events" className="mt-6 inline-flex items-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
            Browse Events
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyTickets;