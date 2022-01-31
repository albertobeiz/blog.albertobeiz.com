import { parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DateFormatter({ dateString }) {
  const date = parseISO(dateString);
  return (
    <time dateTime={dateString}>
      {format(date, 'dd LLLL yyyy', { locale: es })}
    </time>
  );
}
