export interface User {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
}

export interface Student extends User {
  college: string;
  program: string;
  yearLevel: string;
  emotionalStatus: string;
}

export interface Counselor extends User {
  college: string;
  availability: string;
}

export interface Admin extends User {
  active: boolean;
}

export type Users = ["student", "admin", "counselor"];
