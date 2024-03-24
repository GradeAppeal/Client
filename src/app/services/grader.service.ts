import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { GraderAppeal } from '../shared/interfaces/student.interface';
import { Professor } from 'src/app/shared/interfaces/psql.interface';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GraderService {
  private supabase: SupabaseClient;
  session: AuthSession | null = null;
  private courseNameSubject = new Subject<any>();

  constructor(private AuthService: AuthService) {
    this.supabase = this.AuthService.client;
    this.session = this.AuthService.session;
  }

  async isGrader(sid: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('is_grader', {
      sid,
    });
    if (error) {
      console.log({ error });
      throw new Error('isGrader');
    }
    return data;
  }
  /**
   * All appeals assigned to a grader
   * @param gid student grader id
   * @returns All the appeals assigned to grader
   */
  async getAllGraderAppeals(gid: string): Promise<GraderAppeal[]> {
    const { data, error } = await this.supabase.rpc('get_all_grader_appeals', {
      gid,
    });

    if (error) {
      console.log({ error });
      throw new Error('GetAllGraderAppeals');
    }
    return data;
  }

  /**
   * Course-specific appeals assigned to a grader
   * TODO: get only the assigned appeals
   * @param gid student grader id
   * @param cid course id for grader
   * @returns All the appeals assigned to grader
   */
  async getCourseGraderAppeals(
    gid: string,
    cid: number
  ): Promise<GraderAppeal[]> {
    const { data, error } = await this.supabase.rpc('get_grader_appeals', {
      gid,
      cid,
    });

    if (error) {
      console.log({ error });
      throw new Error('GetCourseGraderAppeals');
    }
    return data;
  }

  /**
   * Get an appeal for grader
   * used with new appeal listener
   * @param appid appeal id
   */
  async getNewGraderAppeal(appid: number): Promise<GraderAppeal[]> {
    const { data, error } = await this.supabase.rpc('get_new_grader_appeals', {
      appid,
    });

    if (error) {
      console.log(error.hint);
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * Fetches the student's courses (both enrolled and grading)
   * @param sid student id
   * @returns
   */
  async fetchProfessors(): Promise<Professor[]> {
    const { data, error } = await this.supabase.rpc('get_professors');
    if (error) {
      console.log({ error });
      throw new Error('Error in fetchProfessors');
    }
    return data;
  }
}
