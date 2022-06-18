import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";

declare const Pusher: any;

@Injectable()
export class PusherService {
  private pusherKey: string = environment.pusherKey;
  pusher;
  constructor() {
    this.pusher = new Pusher(this.pusherKey, {
      cluster: "ap2",
      encrypted: true,
    });
  }

  public init(channel) {
    return this.pusher.subscribe(channel);
  }
}
