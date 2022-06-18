import { Injectable } from "@angular/core";
import { ValidatorFn, AbstractControl, FormGroup } from "@angular/forms";

export interface ReturnType {
  [key: string]: boolean;
}

@Injectable({
  providedIn: "root",
})
export class CustomValidationService {
  constructor() {}

  imageTypeValidator(allowedTypes: string): ValidatorFn {
    return (control: AbstractControl): ReturnType | null => {
      if (control.value !== undefined && control.value !== null) {
        const file = control.value;
        console.log(file)
        const extension = file.type;
        const allowed = allowedTypes.replace(/\s+/g, "").split(",");
        console.log(allowed);
        if (!allowed.includes(extension)) {
          return {
            imageType: true,
          };
        }
      }
      return null;
    };
  }

  fileSizeValidator(maxSize: number): ValidatorFn {
    return (control: AbstractControl): ReturnType | null => {
      if (control.value !== undefined && control.value !== null) {
        const file = control.value;
        const size = file.size;
        if (size > maxSize) {
          return {
            maxSize: true,
          };
        }
      } else {
        return null;
      }
    };
  }
}
