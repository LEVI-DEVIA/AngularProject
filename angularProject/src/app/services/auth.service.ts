import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://angularproject-si38.onrender.com/api'; // URL de votre backend

  constructor(private http: HttpClient) {}

  // Méthode pour la connexion
  login(nom: string, password: string): Observable<boolean> {
    return this.http.post<{ success: boolean; user: any; message?: string }>(`${this.apiUrl}/login`, { nom, password })
      .pipe(
        map(response => {
          if (response.success) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            return true;
          }
          throw new Error(response.message || 'Échec de la connexion');
        })
      );
  }

  // Méthode pour la création de compte
  signup(nom: string, password: string): Observable<boolean> {
    return this.http.post<{ success: boolean; user: any; message?: string }>(`${this.apiUrl}/signup`, { nom, password })
      .pipe(
        map(response => {
          if (response.success) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            return true;
          }
          throw new Error(response.message || 'Échec de la création de compte');
        })
      );
  }

  // Méthode pour déconnexion
  logout(): void {
    localStorage.removeItem('currentUser');
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  // Récupérer l'utilisateur connecté
  getCurrentUser(): any {
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  // Vérifier si l'utilisateur est admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user.nom === 'LineoL'; // LineoL est l'admin pour l'instant
  }
}