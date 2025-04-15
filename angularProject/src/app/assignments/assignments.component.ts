import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Composant pour la boîte de dialogue de modification
@Component({
  selector: 'app-edit-assignment-dialog',
  template: `
    <h2 mat-dialog-title>Modifier l'assignment</h2>
    <mat-dialog-content>
      <form>
        <mat-form-field>
          <mat-label>Titre</mat-label>
          <input matInput [(ngModel)]="assignment.titre" name="titre" required>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Description</mat-label>
          <input matInput [(ngModel)]="assignment.description" name="description" required>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Date de création</mat-label>
          <input matInput [(ngModel)]="assignment.dateDeCreation" name="dateDeCreation" required>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Assigner à</mat-label>
          <mat-select [(ngModel)]="assignment.assignedTo" name="assignedTo" required>
            <mat-option *ngFor="let user of users" [value]="user.nom">{{ user.nom }}</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Matière</mat-label>
          <input matInput [(ngModel)]="assignment.matiere" name="matiere" required>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Note</mat-label>
          <input matInput type="number" [(ngModel)]="assignment.note" name="note" required>
        </mat-form-field>
        <mat-form-field>
          <mat-label>Remarques</mat-label>
          <input matInput [(ngModel)]="assignment.remarques" name="remarques">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" (click)="onSave()">Enregistrer</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    CommonModule
  ]
})
export class EditAssignmentDialog {
  assignment: any;
  users: any[];

  constructor(
    public dialogRef: MatDialogRef<EditAssignmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { assignment: any; users: any[] }
  ) {
    this.assignment = { ...data.assignment };
    this.users = data.users;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.assignment);
  }
}

@Component({
  selector: 'app-assignments',
  template: `
    <div class="container">
      <!-- En-tête -->
      <div class="header">
        <h2>Tableau de Bord des Assignments</h2>
        <div class="user-info">
          <span>Connecté en tant que : <strong>{{ currentUser.nom }}</strong></span>
          <mat-icon class="admin-icon" *ngIf="authService.isAdmin()">admin_panel_settings</mat-icon>
        </div>
      </div>

      <!-- Formulaire de création d'assignment (visible uniquement pour l'admin) -->
      <div *ngIf="authService.isAdmin()" class="admin-section">
        <mat-card class="create-card">
          <mat-card-header>
            <mat-card-title>Nouvel Assignment</mat-card-title>
            <mat-card-subtitle>Remplissez les détails pour créer un nouvel assignment</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <form (ngSubmit)="createAssignment()" class="create-form">
              <mat-form-field appearance="outline">
                <mat-label>Titre</mat-label>
                <input matInput [(ngModel)]="newAssignment.titre" name="titre" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Description</mat-label>
                <input matInput [(ngModel)]="newAssignment.description" name="description" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Date de création</mat-label>
                <input matInput [(ngModel)]="newAssignment.dateDeCreation" name="dateDeCreation" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Assigner à</mat-label>
                <mat-select [(ngModel)]="newAssignment.assignedTo" name="assignedTo" required>
                  <mat-option *ngFor="let user of users" [value]="user.nom">{{ user.nom }}</mat-option>
                </mat-select>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Matière</mat-label>
                <input matInput [(ngModel)]="newAssignment.matiere" name="matiere" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Note</mat-label>
                <input matInput type="number" [(ngModel)]="newAssignment.note" name="note" required>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Remarques</mat-label>
                <input matInput [(ngModel)]="newAssignment.remarques" name="remarques">
              </mat-form-field>
              <button mat-raised-button color="primary" type="submit" class="create-button">
                <mat-icon>add</mat-icon> Créer Assignment
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tableau des assignments -->
      <div class="table-section">
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
            <th mat-header-cell *matHeaderCellDef>Date de Création</th>
            <td mat-cell *matCellDef="let assignment">{{ assignment.dateDeCreation }}</td>
          </ng-container>
          <ng-container matColumnDef="createdBy">
            <th mat-header-cell *matHeaderCellDef>Créé par</th>
            <td mat-cell *matCellDef="let assignment">{{ assignment.createdBy }}</td>
          </ng-container>
          <ng-container matColumnDef="assignedTo">
            <th mat-header-cell *matHeaderCellDef>Assigné à</th>
            <td mat-cell *matCellDef="let assignment">{{ assignment.assignedTo }}</td>
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
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let assignment">
              <button mat-icon-button color="primary" (click)="editAssignment(assignment)" *ngIf="authService.isAdmin()">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteAssignment(assignment)" *ngIf="authService.isAdmin()">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #3f51b5;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .header h2 {
      margin: 0;
      font-size: 24px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .admin-icon {
      color: #ffd740;
    }

    .admin-section {
      margin-bottom: 30px;
    }

    .create-card {
      background: linear-gradient(145deg, #ffffff, #e0e0e0);
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }

    .create-card mat-card-title {
      color: #3f51b5;
      font-size: 22px;
      font-weight: 500;
    }

    .create-card mat-card-subtitle {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .create-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .create-form mat-form-field {
      width: 100%;
    }

    .create-button {
      grid-column: span 2;
      padding: 10px 0;
      font-size: 16px;
      background-color: #3f51b5;
      color: white;
      transition: background-color 0.3s;
    }

    .create-button:hover {
      background-color: #303f9f;
    }

    .table-section {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
    }

    th, td {
      text-align: center;
      padding: 12px;
    }

    th {
      background-color: #f5f5f5;
      font-weight: 600;
      color: #333;
    }

    tr:hover {
      background-color: #f9f9f9;
    }

    button mat-icon {
      font-size: 20px;
    }
  `],
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    CommonModule
  ]
})
export class AssignmentsComponent implements OnInit {
  assignments: any[] = [];
  users: any[] = [];
  currentUser: any;
  displayedColumns: string[] = ['titre', 'description', 'dateDeCreation', 'createdBy', 'assignedTo', 'matiere', 'note', 'remarques', 'actions'];

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
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.newAssignment.createdBy = this.currentUser.nom;
  }

  ngOnInit(): void {
    this.loadAssignments();
    if (this.authService.isAdmin()) {
      this.loadUsers();
    }
  }

  loadAssignments(): void {
    const nom = this.currentUser.nom;
    console.log(`Chargement des assignments pour: ${nom}`);
    const endpoint = `http://localhost:3000/api/assignments?nom=${nom}`;
    this.http.get<any[]>(endpoint).subscribe({
      next: (data) => {
        console.log('Assignments reçus:', data);
        this.assignments = data.filter(assignment => {
          if (!assignment._id) {
            console.warn('Assignment sans _id détecté:', assignment);
            this.snackBar.open('Certains assignments sont invalides (ID manquant)', 'OK', {
              duration: 3000,
              verticalPosition: 'top'
            });
            return false;
          }
          return true;
        });
        console.log('Assignments valides:', this.assignments);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des assignments:', err);
        this.snackBar.open('Erreur lors du chargement des assignments', 'OK', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    });
  }

  loadUsers(): void {
    this.http.get<any[]>('http://localhost:3000/api/users').subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
        this.snackBar.open('Erreur lors du chargement des utilisateurs', 'OK', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    });
  }

  createAssignment(): void {
    console.log('Création d’un assignment:', this.newAssignment);
    this.http.post(`http://localhost:3000/api/assignments`, this.newAssignment).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.snackBar.open(`Assignment "${response.assignment.titre}" créé pour ${response.assignment.assignedTo}`, 'OK', {
            duration: 3000,
            verticalPosition: 'top'
          });

          if (this.authService.isAdmin()) {
            console.log('Ajout de l’assignment au tableau pour l’admin:', response.assignment);
            this.assignments.push(response.assignment);
          }

          this.newAssignment = {
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
        this.snackBar.open(err.error.message || 'Erreur lors de la création de l\'assignment', 'OK', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    });
  }

  editAssignment(assignment: any): void {
    if (!assignment._id) {
      this.snackBar.open('Erreur : ID de l\'assignment manquant', 'OK', { duration: 3000, verticalPosition: 'top' });
      return;
    }
    console.log('Modification de l\'assignment:', assignment);
    const dialogRef = this.dialog.open(EditAssignmentDialog, {
      width: '600px',
      data: { assignment, users: this.users }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Données mises à jour à envoyer:', result);
        this.http.put(`http://localhost:3000/api/assignments/${assignment._id}`, result).subscribe({
          next: (response: any) => {
            console.log('Réponse du serveur après modification:', response);
            this.snackBar.open('Assignment mis à jour avec succès', 'OK', { duration: 3000, verticalPosition: 'top' });
            const index = this.assignments.findIndex(a => a._id === assignment._id);
            if (index !== -1) {
              this.assignments[index] = response;
              this.assignments = [...this.assignments];
            }
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour:', err);
            this.snackBar.open(err.error.message || 'Erreur lors de la mise à jour de l\'assignment', 'OK', {
              duration: 3000,
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  deleteAssignment(assignment: any): void {
    if (!assignment._id) {
      this.snackBar.open('Erreur : ID de l\'assignment manquant', 'OK', { duration: 3000, verticalPosition: 'top' });
      return;
    }
    console.log('Suppression de l\'assignment avec ID:', assignment._id);
    if (confirm('Êtes-vous sûr de vouloir supprimer cet assignment ?')) {
      this.http.delete(`http://localhost:3000/api/assignments/${assignment._id}`).subscribe({
        next: (response: any) => {
          console.log('Réponse du serveur après suppression:', response);
          this.snackBar.open(response.message || 'Assignment supprimé avec succès', 'OK', { duration: 3000, verticalPosition: 'top' });
          this.assignments = this.assignments.filter(a => a._id !== assignment._id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.snackBar.open(err.error.message || 'Erreur lors de la suppression de l\'assignment', 'OK', {
            duration: 3000,
            verticalPosition: 'top'
          });
        }
      });
    }
  }
}