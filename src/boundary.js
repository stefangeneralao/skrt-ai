class Boundary {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  midpoint() {
    return createVector((this.a.x + this.b.x) * 0.5, (this.a.y + this.b.y) * 0.5);
  }

  show() {
    stroke('#DDD');
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }

  length() {
    return p5.Vector.dist(this.a, this.b);
  }

  isIntersecting(pos, margin = 5) {
    function pldistance(p1, p2, x, y) {
      const num = abs((p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x);
      const den = p5.Vector.dist(p1, p2);
      return num / den;
    }

    const d = pldistance(this.a, this.b, pos.x, pos.y);
    const distToP1 = p5.Vector.dist(this.a, pos);
    const distToP2 = p5.Vector.dist(this.b, pos);
    if (d < margin && distToP1 < this.length() && distToP2 < this.length()) {
      return true;
    }
    
    return false;
  }
}
