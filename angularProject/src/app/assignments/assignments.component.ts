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

// Assignment interface for type safety
interface Assignment {
  _id: string;
  titre: string;
  description: string;
  dateDeCreation: string;
  createdBy: string;
  assignedTo: string;
  matiere: string;
  note: number;
  remarques: string;
}

// Dialog for confirming deletion
@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title>Confirmer la suppression</h2>
    <mat-dialog-content>
      <p>Êtes-vous sûr de vouloir supprimer l'assignment "{{ data.titre }}" ?</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Supprimer</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmDeleteDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { titre: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

// Dialog for editing assignments
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
  assignment: Assignment;
  users: any[];

  constructor(
    public dialogRef: MatDialogRef<EditAssignmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { assignment: Assignment; users: any[] }
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

// Main Assignments Component
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
              <button mat-icon-button color="warn" (click)="deleteAssignment(assignment)" *ngIf="authService.isAdmin()" [disabled]="isDeleting">
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
  font-family: 'Roboto', sans-serif;
}

/* Enhanced Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%);
  color: white;
  padding: 18px 25px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 20px rgba(63, 81, 181, 0.25);
  position: relative;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.1), transparent 80%);
  pointer-events: none;
}

.header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 500;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 50px;
  backdrop-filter: blur(5px);
}

.admin-icon {
  color: #ffd740;
  filter: drop-shadow(0 0 3px rgba(255, 215, 64, 0.5));
  margin-right: 5px;
}

/* Admin Section */
.admin-section {
  margin-bottom: 40px;
  animation: fadeIn 0.6s ease-out;
}

/* Create Card */
.create-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  padding: 30px;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid rgba(63, 81, 181, 0.1);
  overflow: hidden;
  position: relative;
}

.create-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.create-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(63, 81, 181, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 0;
}

.create-card mat-card-title {
  color: #3f51b5;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 10px;
  position: relative;
  z-index: 1;
}

.create-card mat-card-subtitle {
  color: #666;
  font-size: 15px;
  margin-bottom: 25px;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}

.create-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  position: relative;
  z-index: 1;
}

.create-form mat-form-field {
  width: 100%;
}

.create-form mat-form-field:focus-within {
  transform: translateY(-2px);
  transition: transform 0.3s;
}

.create-button {
  grid-column: span 2;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%);
  color: white;
  transition: all 0.3s;
  border-radius: 8px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(63, 81, 181, 0.3);
  border: none;
  margin-top: 10px;
}

.create-button:hover {
  background: linear-gradient(135deg, #303f9f 0%, #3f51b5 100%);
  box-shadow: 0 6px 20px rgba(63, 81, 181, 0.4);
  transform: translateY(-2px);
}

/* Table Section */
.table-section {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  animation: fadeIn 0.8s ease-out;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

th, td {
  text-align: center;
  padding: 16px;
  transition: background-color 0.2s;
}

th {
  background-color: #f5f7ff;
  font-weight: 600;
  color: #3f51b5;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.7px;
  border-bottom: 2px solid rgba(63, 81, 181, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

tr {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

tr:last-child {
  border-bottom: none;
}

tr:hover {
  background-color: #f8f9ff;
}

tr:hover td {
  color: #3f51b5;
}

button.mat-icon-button {
  width: 40px;
  height: 40px;
  line-height: 40px;
  transition: all 0.3s;
}

button.mat-icon-button:hover {
  background-color: rgba(63, 81, 181, 0.1);
  transform: scale(1.1);
}

button mat-icon {
  font-size: 20px;
  transition: color 0.3s;
}

button.edit-button mat-icon {
  color: #4caf50;
}

button.delete-button mat-icon {
  color: #f44336;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .create-form {
    grid-template-columns: 1fr;
  }

  .create-button {
    grid-column: span 1;
  }

  .header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Add some space between table rows for better readability */
td {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

/* Style for empty state */
.empty-state {
  padding: 40px;
  text-align: center;
  color: #757575;
}

/* Add pagination styling */
.mat-paginator {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background-color: #f5f7ff;
}`],
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
    CommonModule,
    ConfirmDeleteDialog,
    EditAssignmentDialog
  ]
})
export class AssignmentsComponent implements OnInit {
  assignments: Assignment[] = [];
  users: any[] = [];
  currentUser: any;
  isDeleting = false;
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
    const endpoint = `https://angularproject-si38.onrender.com/api/assignments?nom=${nom}`;
    this.http.get<Assignment[]>(endpoint).subscribe({
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
    this.http.get<any[]>('https://angularproject-si38.onrender.com/api/users').subscribe({
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
    this.http.post(`https://angularproject-si38.onrender.com/api/assignments`, this.newAssignment).subscribe({
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

  editAssignment(assignment: Assignment): void {
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
        this.http.put(`https://angularproject-si38.onrender.com/api/assignments/${assignment._id}`, result).subscribe({
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

  deleteAssignment(assignment: Assignment): void {
    if (!assignment._id || this.isDeleting) {
      this.snackBar.open('Erreur : ID de l\'assignment manquant ou suppression en cours', 'OK', { duration: 3000, verticalPosition: 'top' });
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '400px',
      data: { titre: assignment.titre }
    });
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isDeleting = true;
        this.http.delete(`https://angularproject-si38.onrender.com/api/assignments/${assignment._id}`).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.snackBar.open(response.message || 'Assignment supprimé avec succès', 'OK', { duration: 3000, verticalPosition: 'top' });
              this.assignments = this.assignments.filter(a => a._id !== assignment._id);
            } else {
              this.snackBar.open(response.message || 'Erreur lors de la suppression', 'OK', { duration: 3000, verticalPosition: 'top' });
            }
          },
          error: (err) => {
            console.error('Erreur lors de la suppression:', err);
            this.snackBar.open(err.error.message || 'Erreur lors de la suppression de l\'assignment', 'OK', {
              duration: 3000,
              verticalPosition: 'top'
            });
          },
          complete: () => {
            this.isDeleting = false;
          }
        });
      }
    });
  }
}
