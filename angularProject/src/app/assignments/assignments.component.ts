import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // Ajouter pour la liste déroulante
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-assignments',
  template: `
    <div style="text-align: center; margin: 20px;">
      <h2>Assignments de {{ currentUser.nom }}</h2>
      <button mat-raised-button color="warn" (click)="logout()">Se déconnecter</button>
    </div>

    <!-- Formulaire de création d'assignment (visible uniquement pour l'admin) -->
    <div *ngIf="authService.isAdmin()" style="max-width: 600px; margin: 20px auto;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Créer un nouvel assignment</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="createAssignment()">
            <mat-form-field>
              <mat-label>Titre</mat-label>
              <input matInput [(ngModel)]="newAssignment.titre" name="titre" required>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Description</mat-label>
              <input matInput [(ngModel)]="newAssignment.description" name="description" required>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Date de création</mat-label>
              <input matInput [(ngModel)]="newAssignment.dateDeCreation" name="dateDeCreation" required>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Assigner à</mat-label>
              <mat-select [(ngModel)]="newAssignment.assignedTo" name="assignedTo" required>
                <mat-option *ngFor="let user of users" [value]="user.nom">{{ user.nom }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Matière</mat-label>
              <input matInput [(ngModel)]="newAssignment.matiere" name="matiere" required>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Note</mat-label>
              <input matInput type="number" [(ngModel)]="newAssignment.note" name="note" required>
            </mat-form-field>
            <mat-form-field>
              <mat-label>Remarques</mat-label>
              <input matInput [(ngModel)]="newAssignment.remarques" name="remarques">
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit">Créer</button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Tableau des assignments -->
    <table mat-table [dataSource]="assignments" class="mat-elevation-z8">
      <ng-container matColumnDef="titre">
        <th mat-header-cell *matHeaderCellDef>Titre</th>
        <td mat-cell *matCellDef="let assignment">{{ assignment.titre }}</td>
      </ng-container>
      <ng-container matColumnDef="description">
        <th mat-header-cell *matHeaderCellDef>Description</th>
        <td mat-cell *matCellDef="let assignment">{{ assignment.description }}</td>
      </ng-container>
      <ng-container matColumnDef="dateDeCreation">
        <th mat-header-cell *matHeaderCellDef>Date de création</th>
        <td mat-cell *matCellDef="let assignment">{{ assignment.dateDeCreation }}</td>
      </ng-container>
      <ng-container matColumnDef="createdBy">
        <th mat-header-cell *matHeaderCellDef>Créé par</th>
        <td mat-cell *matCellDef="let assignment">{{ assignment.createdBy }}</td>
      </ng-container>
      <ng-container matColumnDef="matiere">
        <th mat-header-cell *matHeaderCellDef>Matière</th>
        <td mat-cell *matCellDef="let assignment">{{ assignment.matiere }}</td>
      </ng-container>
      <ng-container matColumnDef="note">
        <th mat-header-cell *matHeaderCellDef>Note</th>
        <td mat-cell *matCellDef="let assignment">{{ assignment.note }}</td>
      </ng-container>
      <ng-container matColumnDef="remarques">
        <th mat-header-cell *matHeaderCellDef>Remarques</th>
        <td mat-cell *matCellDef="let assignment">{{ assignment.remarques }}</td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [`
    h2 {
      text-align: center;
      margin: 20px 0;
    }
    .mat-elevation-z8 {
      width: 100%;
      margin: 0 auto;
    }
    table {
      width: 90%;
      margin: 0 auto;
    }
    th, td {
      text-align: center;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 10px;
    }
    button {
      width: 100%;
    }
  `],
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule, // Ajouter pour la liste déroulante
    FormsModule,
    CommonModule
  ]
})
export class AssignmentsComponent implements OnInit {
  assignments: any[] = [];
  users: any[] = []; // Liste des utilisateurs pour la liste déroulante
  currentUser: any;
  displayedColumns: string[] = ['titre', 'description', 'dateDeCreation', 'createdBy', 'matiere', 'note', 'remarques'];

  newAssignment = {
    titre: '',
    description: '',
    dateDeCreation: '',
    createdBy: '',
    assignedTo: '',
    matiere: '',
    note: 0,
    remarques: ''
  };

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.newAssignment.createdBy = this.currentUser.nom; // Pré-remplir createdBy avec le nom de l'admin
  }

  ngOnInit(): void {
    this.loadAssignments();
    if (this.authService.isAdmin()) {
      this.loadUsers(); // Charger la liste des utilisateurs si l'utilisateur est un admin
    }
  }

  loadAssignments(): void {
    const nom = this.currentUser.nom;
    this.http.get<any[]>(`http://localhost:3000/api/assignments/${nom}`).subscribe({
      next: (data) => {
        this.assignments = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des assignments:', err);
      }
    });
  }

  loadUsers(): void {
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (data) => {
        this.users = data; // Charger tous les utilisateurs pour la liste déroulante
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
      }
    });
  }

  createAssignment(): void {
    this.http.post(`http://localhost:3000/api/assignments`, this.newAssignment).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Si l'assignment est créé pour l'utilisateur actuel, l'ajouter à la liste
          if (this.newAssignment.assignedTo === this.currentUser.nom) {
            this.assignments.push(response.assignment);
          }
          this.newAssignment = { // Réinitialiser le formulaire
            titre: '',
            description: '',
            dateDeCreation: '',
            createdBy: this.currentUser.nom,
            assignedTo: '',
            matiere: '',
            note: 0,
            remarques: ''
          };
        }
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'assignment:', err);
        alert(err.error.message || 'Une erreur est survenue lors de la création de l\'assignment.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}