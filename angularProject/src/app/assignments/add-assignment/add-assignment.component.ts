import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import { Assignment } from '../assignment.model';
import { AssignmentsService } from '../../shared/assignments.service';
import { Router } from '@angular/router';

@Component({
  providers: [provideNativeDateAdapter()],
  selector: 'app-add-assignment',
  imports: [FormsModule, MatInputModule, MatDatepickerModule, 
    MatButtonModule, MatFormFieldModule],
  templateUrl: './add-assignment.component.html',
  styleUrl: './add-assignment.component.css'
})
export class AddAssignmentComponent  {
  // Pour le formulaire d'ajout
  nomDevoir = "";
  dateDeRendu!:Date;

  constructor(private assignmentsService:AssignmentsService, 
              private router:Router) {}

  
onSubmit(event:any) {
    console.log(`On a soumis le formulaire nom = ${this.nomDevoir}, 
      dateDeRendu = ${this.dateDeRendu}`);

      // On ne crée un nouvel assignment que si le formulaire est valide
      // c'est-à-dire si le nom du devoir n'est pas vide et si la date de rendu est bien définie
      if(this.nomDevoir == "" || this.dateDeRendu == null) {
        console.log("Formulaire invalide");
        return;
      }

      let a = new Assignment();
      a.nom = this.nomDevoir;
      a.dateDeRendu = this.dateDeRendu;
      a.rendu = false;

      // On envoie l'assignment vers le service pour insertion
      this.assignmentsService.addAssignment(a)
      .subscribe(message => {
        console.log(message);

       // On va naviguer vers la page qui affiche la liste des assignments
       // c'est la route par défaut (/ ou /home)
       this.router.navigate(['/home']);
      });
  }

}
