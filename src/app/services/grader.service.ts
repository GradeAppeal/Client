import { Injectable } from '@angular/core';
import { AuthSession, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './auth.service';
import {
  GraderAppeal,
  StudentAppeal,
  StudentCourse,
} from '../shared/interfaces/student.interface';
import { Professor } from 'src/app/shared/interfaces/psql.interface';
import { Course, Assignment } from '../shared/interfaces/psql.interface';

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
   *
   * @param sid student id
   * @returns All the appeals made by the student
   */
  async fetchGraderAppeals(sid: number): Promise<GraderAppeal[]> {
    const { data, error } = await this.supabase.rpc('get_grader_appeals', {
      sid,
    });

    if (error) {
      console.log(error);
      throw new Error('GetGrader');
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
