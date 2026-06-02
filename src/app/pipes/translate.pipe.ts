import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: false,
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey = '';
  private lastValue = '';
  private unsubscribe: () => void;

  constructor(private readonly service: TranslationService) {
    this.unsubscribe = this.service.onChange(() => {
      this.lastValue = this.service.translate(this.lastKey);
    });
  }

  transform(key: string): string {
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastValue = this.service.translate(key);
    }
    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
