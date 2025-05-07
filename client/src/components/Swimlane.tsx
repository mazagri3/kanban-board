import TicketCard from './TicketCard';
import { TicketData } from '../interfaces/TicketData';
import { ApiMessage } from '../interfaces/ApiMessage';

interface SwimlaneProps {
  title: string;
  tickets: TicketData[];
  deleteTicket: (ticketId: number) => Promise<ApiMessage>
}

const Swimlane = ({ title, tickets, deleteTicket }: SwimlaneProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Todo':
        return 'var(--primary-color)';
      case 'In Progress':
        return 'var(--warning-color)';
      case 'Done':
        return 'var(--success-color)';
      default:
        return 'var(--text-color)';
    }
  };

  return (
    <div className="swim-lane">
      <div className="swim-lane-header" style={{ borderBottom: `2px solid ${getStatusColor(title)}` }}>
        <h2>{title}</h2>
        <span className="ticket-count">{tickets.length}</span>
      </div>
      <div className="ticket-list">
        {tickets.map(ticket => (
          <TicketCard 
            key={ticket.id}
            ticket={ticket}
            deleteTicket={deleteTicket}
          />
        ))}
      </div>
    </div>
  );
};

export default Swimlane;
