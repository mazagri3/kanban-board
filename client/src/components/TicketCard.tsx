import { Link } from 'react-router-dom';

import { TicketData } from '../interfaces/TicketData';
import { ApiMessage } from '../interfaces/ApiMessage';
import { MouseEventHandler } from 'react';

interface TicketCardProps {
  ticket: TicketData;
  deleteTicket: (ticketId: number) => Promise<ApiMessage>
}

const TicketCard = ({ ticket, deleteTicket }: TicketCardProps) => {

  const handleDelete: MouseEventHandler<HTMLButtonElement> = async (event) => {
    const ticketId = Number(event.currentTarget.value);
    if (!isNaN(ticketId)) {
      try {
        const data = await deleteTicket(ticketId);
        return data;
      } catch (error) {
        console.error('Failed to delete ticket:', error);
      }
    }
  };

  return (
    <div className='ticket-card'>
      <div className='ticket-header'>
        <h3>{ticket.name}</h3>
        <div className='ticket-actions'>
          <Link 
            to='/edit' 
            state={{id: ticket.id}} 
            className='btn-edit'
          >
            <span className='icon'>✏️</span>
          </Link>
          <button 
            type='button' 
            value={String(ticket.id)} 
            onClick={handleDelete} 
            className='btn-delete'
          >
            <span className='icon'>🗑️</span>
          </button>
        </div>
      </div>
      <p className='ticket-description'>{ticket.description}</p>
      {ticket.assignedUser && (
        <div className='ticket-assignee'>
          <span className='assignee-label'>Assigned to:</span>
          <span className='assignee-name'>{ticket.assignedUser.username}</span>
        </div>
      )}
    </div>
  );
};

export default TicketCard;
