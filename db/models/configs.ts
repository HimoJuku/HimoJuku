import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import {ThemePreference} from '@/constants/settings'
export default class Configs extends Model {
    static table = 'configs';

    @field('sortBy')
    ThemePreference!: ThemePreference;
}
