import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';
import { GraderAppeal } from '../shared/interfaces/student.interface';
import { Professor, Student } from 'src/app/shared/interfaces/psql.interface';

@Injectable({
  providedIn: 'root',
})
export class GraderService {
  private supabase: SupabaseClient;
  session: AuthSession | null = null;

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
  async fetchAllGraderAppeals(gid: string): Promise<GraderAppeal[]> {
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
  async fetchCourseGraderAppeals(
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

  async getAppealStudent(
    appid: number
  ): Promise<{ id: string; first_name: string; last_name: string }> {
    const { data, error } = await this.supabase.rpc('get_appeal_student', {
      appid,
    });
    if (error) {
      console.log(error.hint);
      throw new Error(error.message);
    }
    return data[0];
  }

  async getAppealStudent(
    appid: number
  ): Promise<{ id: string; first_name: string; last_name: string }> {
    const { data, error } = await this.supabase.rpc('get_appeal_student', {
      appid,
    });
    if (error) {
      console.log(error.hint);
      throw new Error(error.message);
    }
    return data[0];
  }
}
