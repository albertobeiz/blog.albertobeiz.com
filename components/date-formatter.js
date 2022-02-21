import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DateFormatter({ dateString }) {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString} className="mr-2">
      {format(date, 'dd LLLL yyyy', { locale: es })}
    </time>
  );
}
