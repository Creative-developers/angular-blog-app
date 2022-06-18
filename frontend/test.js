<div class="card bg-light">
    <div class="card-header">
        <h5 class="card-title">
            Total {{ totalComments }} Comment {{ totalComments > 1 ? "s" : "" }}
        </h5>
    </div>
    <div class="card-body">
        <!-- Comment form-->
        <form class="mb-4" [formGroup]="form">
            <textarea class="form-control" name="body" (keydown)="submitForm($event)" [ngClass]="{ 'is-invalid': isSubmitted && f.body.errors }" formControlName="body" rows="3" placeholder="Join the discussion and leave a comment!"></textarea>
            <div class="invalid-feedback" *ngIf="isSubmitted && f.body.errors">
                <div *ngIf="f.body.errors.required">Comment is required</div>
                <div *ngIf="f.body.errors.minlength">
                    Comment should be at least 3 characters
                </div>
            </div>
        </form>
        <!-- Comment with nested comments-->
        <!-- <div class="d-flex mb-4">
            <!-- Parent comment-->
        <div class="flex-shrink-0">
            <img class="rounded-circle" src="https://dummyimage.com/50x50/ced4da/6c757d.jpg" alt="..." />
        </div>
        <div class="ms-3">
            <div class="fw-bold">Commenter Name</div>
            If you're going to lead a space frontier, it has to be government; it'll never be private enterprise. Because the space frontier is dangerous, and it's expensive, and it has unquantified risks.
            <!-- Child comment 1-->
            <div class="d-flex mt-4">
                <div class="flex-shrink-0">
                    <img class="rounded-circle" src="https://dummyimage.com/50x50/ced4da/6c757d.jpg" alt="..." />
                </div>
                <div class="ms-3">
                    <div class="fw-bold">Commenter Name</div>
                    And under those conditions, you cannot establish a capital-market evaluation of that enterprise. You can't get investors.
                </div>
            </div>
            <!-- Child comment 2-->
            <div class="d-flex mt-4">
                <div class="flex-shrink-0">
                    <img class="rounded-circle" src="https://dummyimage.com/50x50/ced4da/6c757d.jpg" alt="..." />
                </div>
                <div class="ms-3">
                    <div class="fw-bold">Commenter Name</div>
                    When you put money directly to a problem, it makes a good headline.
                </div>
            </div>
        </div>
    </div> -->
    <!-- Single comment-->
    <div class="d-flex">
        <div class="flex-shrink-0">
            <img class="rounded-circle" src="https://dummyimage.com/50x50/ced4da/6c757d.jpg" alt="..." />
        </div>
        <div class="ms-3">
            <div class="fw-bold">Commenter Name</div>
            When I look at the universe and all the ways the universe wants to kill us, I find it hard to reconcile that with statements of beneficence.
        </div>
    </div>
</div>
</div>