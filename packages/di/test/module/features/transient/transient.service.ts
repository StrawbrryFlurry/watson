import { Injectable } from '@di/decorators/injectable.decorator';
import { InjectorLifetime } from '@di/providers/injection-token';

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Transient })
export class TransientService {}
