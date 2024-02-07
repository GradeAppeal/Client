import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import {
  Assignment,
  Message,
  Course,
  Student,
  Professor,
} from 'src/app/shared/interfaces/psql.interface';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private supabase: SupabaseClient;
  session: AuthSession | null = null;

  constructor(private authService: AuthService) {
    this.supabase = this.authService.client;
    this.session = this.authService.session;
  }

  /**
   * Listens to @tableName changes
   * @param tableName table to listen
   * @param channelName subscription channel
   * @param event INSERT, UPDATE, DELETE, or *
   * @returns the payload changes as observable
   */
  getTableChanges(
    tableName: string,
    channelName: string,
    filter?: string
  ): Observable<any> {
    const changes = new Subject();
    this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName, filter: filter },
        (payload) => {
          changes.next(payload);
        }
      )
      .subscribe();

    return changes.asObservable();
  }

  /**
   * Get course information
   * @param cid course id
   * @returns Course information
   */
  async getCourse(cid: number): Promise<Course> {
    const { data, error } = await this.supabase.rpc('get_course', {
      cid,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data[0];
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
    console.log(aid);
    const { data, error } = await this.supabase.rpc('get_all_messages', {
      aid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchMessages');
    }
    // console.log({ data });
    return data;
  }

  /**
   * The student should not see messages between the professor & grader
   * @param aid appeal id
   * @param sid student id
   * @param pid professor id
   * @returns Interactions between student and professor
   */
  async fetchStudentMessages(
    aid: number,
    sid: string,
    pid: string
  ): Promise<Message[]> {
    console.log(aid);
    const { data, error } = await this.supabase.rpc('get_student_messages', {
      aid,
      sid,
      pid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchStudentMessages');
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
    from_grader: boolean,
    sender_name: string,
    recipient_name: string
  ): Promise<number> {
    const { data, error } = await this.supabase.rpc('insert_message', {
      appid,
      created_at,
      from_grader,
      message_text,
      recipient_id,
      sender_id,
      sender_name,
      recipient_name,
    });
    if (error) {
      console.log(error);
      throw new Error('insert message');
    }
    return data;
  }

  /**
   * Marks appeal.isread as true
   * @param appid appeal id
   */
  async mark_appeal_as_read(aid: number): Promise<number> {
    const { data, error } = await this.supabase.rpc('mark_appeal_as_read', {
      aid,
    });
    if (error) {
      console.log(error);
      throw new Error('mark_appeal_as_read');
    }
    return data;
  }

  /**
   * Marks appeal.isread as false
   * @param appid appeal id
   */
  async mark_appeal_as_unread(aid: number): Promise<number> {
    const { data, error } = await this.supabase.rpc('mark_appeal_as_unread', {
      aid,
    });
    if (error) {
      console.log(error);
      throw new Error('mark_appeal_as_read');
    }
    return data;
  }

  async getStudent(sid: string): Promise<Student> {
    const { data, error } = await this.supabase.rpc('get_student', {
      sid,
    });
    if (error) {
      console.log({ error });
      throw new Error('getStudent');
    }
    return data[0];
  }
  async getProfessor(pid: string): Promise<Professor> {
    const { data, error } = await this.supabase.rpc('get_professor', {
      pid,
    });
    if (error) {
      console.log({ error });
      throw new Error('getProfessor');
    }
    return data[0];
  }
}
