import { Component, EventEmitter, Input, Output, signal, OnInit } from "@angular/core";

export type ConfirmationAction = "delete" | "edit" | "remove" | "save" | "custom";

@Component({
  selector: "app-confirmation-popup",
  standalone: true,
  templateUrl: "./confirmation-popup.component.html",
  styleUrls: ["./confirmation-popup.component.css"]
})
// popup
export class ConfirmationPopupComponent implements OnInit {
  @Input() title = "Confirmation";
  @Input() message = "Are you sure you want to perform this action?";
  @Input() actionType: ConfirmationAction = "delete";
  @Input() itemName?: string;
  @Input() confirmButtonText?: string;
  @Input() cancelButtonText = "Cancel";
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  protected actionText = signal<string>("Confirm");
  protected iconClass = signal<string>("fa-question");

  ngOnInit() {
    if (this.confirmButtonText) {
      this.actionText.set(this.confirmButtonText);
      return;
    }

    switch (this.actionType) {
      case "delete":
        this.actionText.set("Delete");
        this.iconClass.set("fa-trash");
        break;
      case "edit":
        this.actionText.set("Save Changes");
        this.iconClass.set("fa-edit");
        break;
      case "remove":
        this.actionText.set("Remove");
        this.iconClass.set("fa-times");
        break;
      case "save":
        this.actionText.set("Save");
        this.iconClass.set("fa-save");
        break;
      default:
        this.actionText.set("Confirm");
        this.iconClass.set("fa-check");
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}