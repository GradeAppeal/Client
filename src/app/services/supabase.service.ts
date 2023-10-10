import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { StudentCourse } from '../shared/interfaces/student.interface';
import {
  ProfessorCourse,
  ProfessorAppeal,
} from '../shared/interfaces/professor.interface';
import { Course, Assignment } from '../shared/interfaces/psql.interface';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  _session: AuthSession | null = null;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  get session() {
    this.supabase.auth.getSession().then(({ data }) => {
      this._session = data.session;
    });
    return this._session;
  }

  profile(user: User) {
    return this.supabase
      .from('User')
      .select(`first_name, last_name, email`)
      .eq('id', user.id)
      .single();
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  signIn(email: string) {
    return this.supabase.auth.signInWithOtp({ email });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  // updateProfile(profile: Profile) {
  //   const update = {
  //     ...profile,
  //     updated_at: new Date(),
  //   };

  //   return this.supabase.from('profiles').upsert(update);
  // }

  /**
   * Fetches the student's courses (both enrolled and grading)
   * @param sid student id
   * @returns
   */
  async fetchStudentCourses(sid: number): Promise<StudentCourse[]> {
    const { data, error } = await this.supabase.rpc('get_student_courses', {
      sid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchStudentCourses');
    }
    return data;
  }

  /**
   * fetch from supabase: professor courses
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchProfessorCourses(pid: number): Promise<ProfessorCourse[]> {
    const { data, error } = await this.supabase.rpc('get_professor_courses', {
      pid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchProfessorCourses');
    }
    return data;
  }

  /**
   * fetch from supabase: professor appeals
   * @param pid professor id (later replaced with auth.id)
   * @returns courses the prof is teaching in JSON format
   */
  async fetchProfessorAppeals(pid: number): Promise<any> {
    const { data, error } = await this.supabase.rpc('get_professor_appeals', {
      pid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchProfessorAppeals');
    }
    return data;
  }
  /**
   * fetch from supabase: student grade for an assignment they made an appeal for
   * @param aid assignment id
   * @param sid student_id
   * @returns student's grade
   */
  async fetchStudentGrade(aid: number, sid: number): Promise<number> {
    const { data, error } = await this.supabase.rpc('get_student_grade', {
      aid,
      sid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchStudentGrade');
    }
    return data;
  }

  /**
   * Fetch course information for new appeal
   * @param cid course id for appeal
   * @returns The course of the assignment the student is making an appeal for
   */
  async fetchCourseForNewAppeal(cid: number): Promise<Course> {
    const { data, error } = await this.supabase.rpc('get_course', {
      cid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchCourseForNewAppeal');
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
   * Writes student appeal to database
   * @param aid assignment id from UI
   * @param sid student id from auth
   * @param cid course id from UI
   * @param created_at date & time of appeal submission
   * @param appeal_text student appeal
   */
  async insertNewAppeal(
    aid: number,
    sid: number,
    cid: number,
    created_at: Date,
    appeal_text: string
  ): Promise<void> {
    const { data, error } = await this.supabase.rpc('insert_new_appeal', {
      aid,
      appeal_text,
      cid,
      created_at,
      sid,
    });

    if (error) {
      console.log(error);
      throw new Error('insertNewAppeal');
    }
    console.log({ data });
  }

   /**
   * Writes new assignment to database
   * @param cid course id from UI
   * @param assignment_name name of assignment
   */
   async insertNewAssignment(
    cid: number,
    assignment_name: string,
  ): Promise<void> {
    const { data, error } = await this.supabase.rpc('insert_new_assignment', {
      cid,
      assignment_name,
    });

    if (error) {
      console.log(error);
      throw new Error('insertNewAppeal');
    }
    console.log({ data });
  }
}
