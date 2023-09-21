import { Injectable } from '@angular/core';
import {
  AuthChangeEvent,
  AuthSession,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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
  async fetchStudentCourses(sid: number) {
    const { data, error } = await this.supabase.rpc('get_student_courses', {
      sid,
    });
    if (error) {
      console.log(error);
      throw new Error('Error in fetchStudentCourses');
    }
    return data;
  }

  async fetchAllCourses() {
    let { data, error } = await this.supabase.rpc('get_all_courses');

    if (error) console.error(error);
    else return data;
  }
}
