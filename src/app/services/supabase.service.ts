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
import { StudentCourse } from '../shared/student.interface';
import {
  ProfessorCourse,
  ProfessorAppeal,
} from '../shared/professor.interface';

export interface Profile {
  id?: string;
  username: string;
  website: string;
  avatar_url: string;
}

export interface Course {
  id: number;
  prefix: string;
  code: number;
  name: string;
  section: string;
  semester: string;
  year: number;
}

export interface CourseState {
  courses: Course[];
}

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

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    };

    return this.supabase.from('profiles').upsert(update);
  }

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
}
