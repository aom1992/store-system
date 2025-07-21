import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  constructor() { }

  /**
   * @param color
   * @returns
   */
  getColor(color: string): string {
    switch (color) {
      case 'danger':
        return '#dc3545'; // Red
      case 'warning':
        return '#F06105'; // Warning
      case 'amber':
        return '#ffc107'; // Amber
      case 'yellow':
        return '#fcec0a'; // Yellow
      case 'yellow2':
        return '#FFF4B7'; // Yellow
      case 'primary':
        return '#007bff'; // Blue
      case 'info':
        return '#4CC9FE'; // Info
      case 'navy':
        return '#4635B1'; // Navy
      case 'purple':
        return '#A594F9'; // Purple
      case 'pink':
        return '#FFCFEF'; // Pink
      case 'success':
        return '#008000'; // Green
      case 'lime':
        return '#76BA1B'; // Lime green
      case 'mint':
        return '#B5FCCD'; // Mint
      case 'earth':
        return '#f88379'; // Earth Yellow
      case 'gray':
        return '#c8ccd0'; // Gray
      default:
        return '#6c757d';
    }
  }

  /**
   * @param backgroundColor
   * @returns
   */
  getTextColorForBackground(backgroundColor: string): string {
    const useBlackTextColors = ['#FFF4B7', '#fcec0a', '#FFCFEF', '#B5FCCD'];
    if (useBlackTextColors.includes(backgroundColor)) {
      return '#000000';
    }
    return '#ffffff'; 
  }
}