import { Component, Input, OnInit } from '@angular/core';
import { Assignment } from '../assignment.model';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AssignmentsService } from '../../shared/assignments.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-assignment-detail',
  imports: [MatCardModule, CommonModule, MatButtonModule, 
    MatCheckboxModule, RouterLink],
  templateUrl: './assignment-detail.component.html',
  styleUrl: './assignment-detail.component.css'
})
export class AssignmentDetailComponent implements OnInit{
  // Passé sous forme d'attribut dynamique par le composant père
  // dans la déclaration HTML du fils :
  // <assignment-detail [assignmentTransmis]="assignmentSelectionne"></assignment-detail>
  @Input()
  assignmentTransmis?:Assignment;

  constructor(private assignmentsService:AssignmentsService, 
    private route:ActivatedRoute,
    private router:Router) {}

  ngOnInit(): void {
    // appelée quand le composant est instancié
    console.log("ngOnInit appelé");
    // Exemple de récupération de "Query Parameters", il s'agit
    // des clé/valeurs qui suivent le ? dans l'URL
    // exemple : http://localhost:4200/assignment/1?page=1&limit=10&debug=true
    let queries = this.route.snapshot.queryParams;
    console.log(queries);
    if(queries['debug']) {
      // etc.
    }

    // Exemple de récupération du fragment d'URL 
    // (il ne peut y en avoir qu'un). Le fragment est la partie
    // de l'URL qui suit le #. Par ex : http://localhost:4200/assignment/1#top
    let fragment = this.route.snapshot.fragment;
    console.log(fragment);

    this.getAssignment();
  }

  getAssignment(): void {
    // On récupère l'id dans l'URL. Le + au début est une astuce
    // pour convertir la chaîne de caractères en nombre
    const _id:string = this.route.snapshot.params['id'];
    console.log("ID = " + _id);
    // On utilise le service assignmentsService pour récupérer l'assignment
    // qui a l'id qu'on vient de récupérer de l'URL
    this.assignmentsService.getAssignment(_id)
    .subscribe(a => {
      this.assignmentTransmis = a;
    });
  }

  assignmentRendu() {
    if(!this.assignmentTransmis) return;

    // On utilise le service pour mettre à jour l'assignment
    this.assignmentTransmis.rendu = true;

    // on demande au service de faire l'update
    this.assignmentsService.updateAssignment(this.assignmentTransmis)
    .subscribe(message => {
      console.log(message);
      // On re  affiche la liste
      this.router.navigate(['/home']);
    });
  }

  onDeleteAssignment() {
    if(!this.assignmentTransmis) return;
    
    // On utilise le service pour supprimer l'assignment
    this.assignmentsService.deleteAssignment(this.assignmentTransmis)
    .subscribe(message => {
      console.log(message);
      // on cache la vue de détail puisque
      // l'assignment a été supprimé
      this.assignmentTransmis = undefined;
      // On re  affiche la liste
      this.router.navigate(['/home']);
    });
  }

}
