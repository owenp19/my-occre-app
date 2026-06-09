import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';

@Injectable({ providedIn: 'root' })
export class CalendarReminderService {
  async shareReturnReminder(params: {
    title: string;
    description: string;
    returnDate: Date;
    location?: string;
  }): Promise<void> {
    const start = new Date(params.returnDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const ics = this.buildIcs({
      title: params.title,
      description: params.description,
      dtStart: start,
      dtEnd: end,
      location: params.location ?? '',
    });

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    try {
      await Share.share({
        text: params.title,
        url,
        title: params.title,
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private buildIcs(opts: {
    title: string;
    description: string;
    dtStart: Date;
    dtEnd: Date;
    location: string;
  }): string {
    const fmt = (d: Date): string =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//OCCRE//TouristCard//ES',
      'BEGIN:VEVENT',
      `DTSTART:${fmt(opts.dtStart)}`,
      `DTEND:${fmt(opts.dtEnd)}`,
      `SUMMARY:${opts.title}`,
      `DESCRIPTION:${opts.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${opts.location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }
}
