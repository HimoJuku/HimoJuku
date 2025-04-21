import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

import { ThemePreference } from '@/constants/settings';
export default class Settings extends Model {
    static table = 'settings';

    @field('ThemePreference')
    ThemePreference!: ThemePreference;
}
