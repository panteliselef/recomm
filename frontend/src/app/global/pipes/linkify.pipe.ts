import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
    name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

    private URLRegex = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");

    constructor(private _domSanitizer: DomSanitizer) {
    }

    transform(value: any, args?: any): any {
        return this._domSanitizer.bypassSecurityTrustHtml(this.stylize(value));
    }

    private stylize(text: string): string {

        const matches = text.match(this.URLRegex);
        if (!matches) return text.replace('\n', '<br/>');
        return text.replace(this.URLRegex, `<a class="inline-message-link" href="${matches[0]}" target="_blank" rel="noopener noreferrer">${matches[0]}</a> `);
    }

}
