import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoCreateComponent } from './producto-create.component';

describe('ProductoCreateComponent', () => {
  let component: ProductoCreateComponent;
  let fixture: ComponentFixture<ProductoCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
