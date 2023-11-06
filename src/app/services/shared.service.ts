import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './auth.service';
import {
  Assignment,
  Message,
  User,
} from 'src/app/shared/interfaces/psql.interface';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private supabase: SupabaseClient;
  session: AuthSession | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
    this.session = this.supabaseService.session;
  }

  /**
   * Fetch assignments for a particular course
   * @param cid course id for appeal
   * @returns List of assignments for a course
   */
  async fetchAssignmentsForNewAppeal(cid: number): Promise<Assignment[]> {
    const { data, error } = await this.supabase.rpc('get_assignments', {
      cid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchAssignmentsForNewAppeal');
    }
    return data;
  }

  /**
   * Get Messages from Supabase
   * @param aid appeal id
   * @returns list of all interaction history
   */
  async fetchMessages(aid: number): Promise<Message[]> {
    const { data, error } = await this.supabase.rpc('get_messages', {
      aid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchMessages');
    }
    return data;
  }

  /**
   * Inserts interaction history to supabase
   * @param appid appeal id
   * @param sender_id sender id--depends on student/prof mode
   * @param recipient_id recipient id--depends on student/prof mode
   * @param created_at timestamp
   * @param message_text text
   * @param from_grader boolean: grader or not
   * @returns 1 if insert was successful, 0 otherwise
   */
  async insertMessage(
    appid: number,
    sender_id: string,
    recipient_id: string,
    created_at: Date,
    message_text: string,
    from_grader: boolean
  ): Promise<number> {
    const { data, error } = await this.supabase.rpc('insert_message', {
      appid,
      created_at,
      from_grader,
      message_text,
      recipient_id,
      sender_id,
    });
    if (error) {
      console.log(error);
      throw new Error('insert message');
    }
    return data;
  }

  async getUserInfo(uid: string): Promise<User> {
    const { data, error } = await this.supabase.rpc('get_user_info', {
      uid,
    });
    if (error) {
      console.log(error);
      throw new Error('getUser');
    }
    return data[0];
  }
}
