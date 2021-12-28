import { Injectable } from '@di/decorators';
import { InjectorLifetime } from '@di/providers';

@Injectable({ providedIn: "module", lifetime: InjectorLifetime.Transient })
export class TransientService {}
