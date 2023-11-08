import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './auth.service';
import { GraderAppeal } from '../shared/interfaces/student.interface';
import { Professor } from 'src/app/shared/interfaces/psql.interface';

@Injectable({
  providedIn: 'root',
})
export class GraderService {
  private supabase: SupabaseClient;
  session: AuthSession | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
    this.session = this.supabaseService.session;
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
      console.log(error);
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
      console.log(error);
      throw new Error('GetCourseGraderAppeals');
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
      console.log(error);
      throw new Error('Error in fetchProfessors');
    }
    return data;
  }
}