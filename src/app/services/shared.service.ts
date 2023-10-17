import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './auth.service';
import { Assignment, Message } from '../shared/interfaces/psql.interface';

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
  async insertMessages(
    appid: number,
    sender_id: number,
    recipient_id: number,
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
      throw new Error('insert messages');
    }
    return data;
  }

  /**
   * Get corresponding user ID for student or professor
   * @param id id for Students or Professors table
   * @param type student or professor type
   * @returns the id for accessing the Users Table
   * TODO: user id will eventually become type UUID, not bigint (update accordingly)
   */
  async getUserId(id: number, type: 'student' | 'professor'): Promise<number> {
    const input = type == 'student' ? { sid: id } : { pid: id };
    const { data, error } = await this.supabase.rpc(
      `get_${type}_user_id`,
      input
    );
    if (error) {
      console.log(error);
      throw new Error('getUserId:');
    }
    return data;
  }
}
