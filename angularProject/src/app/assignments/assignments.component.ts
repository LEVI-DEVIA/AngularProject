import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RenduDirective } from '../shared/rendu.directive';
import { NonRenduDirective } from '../shared/non-rendu.directive';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { Assignment } from './assignment.model';
import { AssignmentDetailComponent } from './assignment-detail/assignment-detail.component';
import { AssignmentsService } from '../shared/assignments.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-assignments',
  imports: [CommonModule, RenduDirective, NonRenduDirective,
    MatListModule, MatDividerModule, MatButtonModule,
    MatInputModule,MatFormFieldModule,FormsModule,
    MatTableModule, MatPaginatorModule,
    RouterLink],
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.css'
})

export class AssignmentsComponent implements OnInit {
  titre = 'Liste des assignments';
  assignments: Assignment[] = [];
  
  // Pour la pagination
  page = 1;
  limit = 4;
  totalDocs = 2000;
  totalPages = 667;
  pagingCounter = 1;
  hasPrevPage = false;
  hasNextPage = true;
  prevPage = null;
  nextPage = 2;
  // Pour la data table angular
  displayedColumns: string[] = ['nom', 'dateDeRendu', 'rendu'];

  // Attention, pour l'injection de service, mettre en private !!! Sinon
  // ça ne marche pas
  constructor(private assignementsService: AssignmentsService,
              private router: Router) {}

  ngOnInit() {
    console.log("ngOnInit appelé lors de l'instanciation du composant");

    // On récupère les assignments depuis le service
    this.getAssignments();

    /*
    // on veut passer la propriété ajoutActive à true au bout de 3 secondes
    setTimeout(() => {
      this.ajoutActive = true;
    }, 3000);
    */
  }

  getAssignments() {
    this.assignementsService.getAssignmentsPagines(this.page, this.limit)
      .subscribe(data => {
        this.assignments = data.docs;
        this.page = data.page;
        this.limit = data.limit;
        this.totalDocs = data.totalDocs;
        this.totalPages = data.totalPages;
        this.pagingCounter = data.pagingCounter;
        this.hasPrevPage = data.hasPrevPage;
        this.hasNextPage = data.hasNextPage;
        this.prevPage = data.prevPage;
        this.nextPage = data.nextPage;

        console.log("Données reçues dans le subscribe");
      });
    console.log("APRES L'APPEL AU SERVICE");
  }

  pageSuivante() {
    this.page++;
    this.getAssignments();
  }

  pagePrecedente() {
    this.page--;
    this.getAssignments();
  }

  dernierePage() {
    this.page = this.totalPages;
    this.getAssignments();
  }
  premierePage() {
    this.page = 1;
    this.getAssignments();
  }

  // Pour le composant material paginator
  onPageEvent(event: any) {
    console.log(event);
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.getAssignments();
  }

  getColor(a: any): string {
    if (a.rendu) return 'green';
    else
      return 'red';
  }

  afficheDetail(row: any) {
    console.log(row);
    // On récupère l'id de l'assignment situé dans la colonne _id de la ligne
    // sélectionnée
    let id = row._id;
    // et on utilise le routeur pour afficher le détail de l'assignment
    this.router.navigate(['/assignments', id]);
  }
}
